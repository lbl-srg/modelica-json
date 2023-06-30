const path = require('path')
const fs = require('bluebird').promisifyAll(require('fs'))
const oe = require('./objectExtractor.js')
const ut = require('./util.js')
const rdflib = require('rdflib')

/**
 * function to get path to allObjects json
 */
function getAllObjectsFilePathOfClass (className, moFile, outputDir) {
  if (moFile === null || moFile === undefined) {
    moFile = className
  }
  if (moFile.endsWith('.mo')) {
    moFile = moFile.split('.mo')[0]
  }
  moFile = moFile.replaceAll('.', path.sep)

  var modelicaPaths = ut.getMODELICAPATH()
  for (let i = 0; i < modelicaPaths.length; i++) {
    var modelicaPath = modelicaPaths[i]
    var tempClassName = moFile
    if (tempClassName.startsWith(modelicaPath)) {
      tempClassName = tempClassName.split(modelicaPath)[1]
    }
    while (tempClassName !== undefined && tempClassName.length !== 0) {
      var moFilePath = path.join(modelicaPath, tempClassName + '.mo')
      if (fs.existsSync(moFilePath)) {
        var allObjectsFilePath = path.join(outputDir, 'objects', tempClassName + '.json')

        if (fs.existsSync(allObjectsFilePath)) {
          return allObjectsFilePath
        }
      } else {
          // console.log("not exists ", moFilePath)
      }
      var tokens = tempClassName.split(path.sep)
      tokens.pop()
      tempClassName = tokens.join(path.sep)
    }
  }
  return ''
}

/**
 * Function that appends parent instance identifier to all instances.
 * For example, parent = "parent" and instances = {'a': {}, 'b': {}},
 * output = {'parent.a': {}, 'parent.b;': {}}
 * @param parent  parent instance identifier (empty for the top level class)
 * @param instances dictionary of all instances
 * @returns
 */
function updateInstancesKey (parent, instances) {
  if (parent === undefined || parent === null || parent === '') {
    return instances
  } else if (parent.endsWith('.')) {
    parent = parent.slice(0, -1)
  }
  if (instances === {} || instances === undefined || Object.keys(instances) === 0) {
    return instances
  }
  var keys = Object.keys(instances)
  keys.forEach(instance => {
    instances[parent + '.' + instance] = instances[instance]
    delete instances[instance]
  })
  return instances
}

function updateConnectionsIdentifiers (parent, connections) {
  if (parent === undefined || parent === null || parent === '') {
    return connections
  } else if (parent.endsWith('.')) {
    parent = parent.slice(0, -1)
  }
  if (connections === {} || connections === undefined || Object.keys(connections) === 0) {
    return connections
  }
  var keys = Object.keys(connections)
  keys.forEach(connection => {
    var toList = connections[connection]
    var newConnection = parent + '.' + connection
    var newToList = []
    toList.forEach(to => {
      newToList.push(parent + '.' + to)
    })
    connections[newConnection] = newToList
    delete connections[connection]
  })
  return connections
}

function getRedeclarationsFromClassModification (classModifications) {
  var redeclaredInstances = {}
  var identifier
  classModifications.forEach(classModification => {
    var elementRedeclaration = classModification.element_redeclaration
    if (elementRedeclaration !== undefined && elementRedeclaration !== null) {
      var componentClause1 = elementRedeclaration.component_clause1
      var shortClassDefinition = elementRedeclaration.short_class_definition
      if (componentClause1 !== undefined && componentClause1 !== null) {
        // TODO: handle short class definition
        var typePrefix = componentClause1.type_prefix
        var typeSpecifier = componentClause1.type_specifier
        identifier = componentClause1.component_declaration1.declaration.identifier
        var annotation = componentClause1.component_declaration1.declaration.annotation
        redeclaredInstances[identifier] = {
          'type_prefix': typePrefix,
          'type_specifier': typeSpecifier,
          'type': 'element',
          'annotation': annotation,
          'semantics': oe.extractSemanticsFromAnnotations(annotation, identifier)
        }
      }
      if (shortClassDefinition !== undefined && shortClassDefinition !== null) {
        var shortClassSpecifier = shortClassDefinition.short_class_specifier
        identifier = shortClassSpecifier.identifier
        var shortClassSpecifierValue = shortClassSpecifier.value
        var name = null

        if ('name' in shortClassSpecifierValue && shortClassSpecifierValue.name !== undefined) {
          name = shortClassSpecifierValue.name
          redeclaredInstances[identifier] = {
            'type': 'short_class_specifier',
            'type_specifier': name,
            'short_class_specifier_value': shortClassSpecifierValue
          }
        } else if ('enum_list' in shortClassSpecifierValue && shortClassSpecifierValue.enum_list !== undefined) {
          var enumList = shortClassSpecifierValue.enum_list

          for (let j = 0; j < enumList.length; j++) {
            var enumListIdentifier = enumList[j].identifier
            redeclaredInstances[enumListIdentifier] = {
              'type': 'enumeration',
              'enumeration_literal': enumList[j]
            }
          }
        }
      }
    }
  })
  return redeclaredInstances
}

function updateAllObjectsWithExtendsImports (className, moFile, outputDir) {
  var allObjectsPath = getAllObjectsFilePathOfClass(className, moFile, outputDir)

  if (allObjectsPath === '') {
    // TODO: handle here
    return {'instances': {}, 'requiredReferences': {}}
  }

  var allObjects = JSON.parse(fs.readFileSync(allObjectsPath, 'utf8'))
  var instances = allObjects.instances

  var allKeys = Object.keys(instances)
  allKeys.forEach(instanceIdentifier => {
    var instanceInfo = instances[instanceIdentifier]
    if (instanceInfo !== undefined && instanceInfo.type_specifier !== undefined) {
      // found instance of a class that has been defined within this mo clas
      if (instanceInfo.type_specifier in instances && instances[instanceInfo.type_specifier].type === 'long_class_specifier') {
        var newClass = instanceInfo.type_specifier
        allKeys.forEach(instanceIdentifier2 => {
          if (instanceIdentifier2 in instances) {
            if (instances[instanceIdentifier2].long_class_specifier_identifier !== undefined && instances[instanceIdentifier2].long_class_specifier_identifier !== null) {
              if (instances[instanceIdentifier2].long_class_specifier_identifier === newClass) {
                instances[instanceIdentifier + '.' + instanceIdentifier2] = instances[instanceIdentifier2]
                delete instances[instanceIdentifier2]
              }
            }
          }
        })
      }
    }
  })
  var requiredReferences = allObjects.requiredReferences

  var connections = {}
  if ('connections' in requiredReferences && requiredReferences.connections !== null && requiredReferences.connections !== undefined) {
    connections = requiredReferences.connections
  }

  var importClauses = []
  if ('import_clause' in requiredReferences && requiredReferences.import_clause !== null && requiredReferences.import_clause !== undefined) {
    importClauses = importClauses.concat(requiredReferences.import_clause)
  }

  if ('extends_clause' in requiredReferences && requiredReferences.extends_clause !== undefined && requiredReferences.extends_clause !== null) {
    var extendClauses = []
    var parsedExtendClauseNames = []
    var traversedExtendClauses = []
    var extendedInstances = {}
    var extendedConnections = {}

    extendClauses = extendClauses.concat(requiredReferences.extends_clause)
    let i = 0
    while (traversedExtendClauses.length !== extendClauses.length) {
      var extendsClause = extendClauses[i]
      var extendedClassName = extendsClause.name
      var extendedClassModification = extendsClause.class_modification
      // TODO: handle annotations
      // var extendedAnnotation = extendClause.annotation
      parsedExtendClauseNames.push(extendedClassName)

      var extendedJsonFilePath = getAllObjectsFilePathOfClass(extendedClassName, null, outputDir)
      var extendedAllObjects = null
      if (fs.existsSync(extendedJsonFilePath)) {
        extendedAllObjects = JSON.parse(fs.readFileSync(extendedJsonFilePath, 'utf8'))
      } else {
        traversedExtendClauses.push(extendsClause)
        i += 1
        continue
      }

      // below extracts the allObjects from the extended class and any extends classes
      var newRequiredReferences = extendedAllObjects.requiredReferences
      if ('connections' in newRequiredReferences && newRequiredReferences.connections !== null && newRequiredReferences.connections !== undefined) {
        var newConnections = newRequiredReferences.connections
        extendedConnections = oe.updateConnections(extendedConnections, newConnections)
      }
      if ('extends_clause' in newRequiredReferences && newRequiredReferences.extends_clause !== null && newRequiredReferences.extends_clause !== undefined) {
        var extendsClause2 = newRequiredReferences.extends_clause
        if (!(extendsClause2.name in parsedExtendClauseNames)) {
          extendClauses = extendClauses.concat(extendsClause2)
        }
      }
      if ('import_clause' in newRequiredReferences && newRequiredReferences.import_clause !== null && newRequiredReferences.import_clause !== undefined) {
        importClauses = importClauses.concat(newRequiredReferences.import_clause)
      }
      var newInstances = extendedAllObjects.instances
      if (extendedClassModification !== null && extendedClassModification !== undefined) {
        var redeclaredInstances = getRedeclarationsFromClassModification(extendedClassModification)

        if (Object.keys(redeclaredInstances).length !== 0) {
          for (var key in redeclaredInstances) {
            if (key in newInstances) {
              redeclaredInstances[key]['long_class_specifier_identifier'] = newInstances[key]['long_class_specifier_identifier']
              redeclaredInstances[key]['within'] = newInstances[key]['within']
              delete newInstances[key]
              newInstances[key] = redeclaredInstances[key]
            }
          }
        }
      }

      if (newInstances !== null && newInstances !== undefined) {
        extendedInstances = Object.assign({}, extendedInstances, newInstances)
      }
      traversedExtendClauses.push(extendsClause)
      i += 1
    }
  }

  var importedInstances = {}
  if (importClauses.length > 0) {
    for (var importClause in importClauses) {
      var importClauseIdentifier = importClause.identifier
      var importClauseName = importClause.name
      // TODO: handle importList and dotStar
      // var dotStar = importClause.dot_star
      // var importList = importClause.import_list

      if (importClauseIdentifier !== null && importClauseIdentifier !== undefined) {
        importedInstances[importClauseIdentifier] = {
          'type_specifier': importClauseName,
          'type': 'import_clause'
        }
      }
    }
  }

  instances = Object.assign({}, instances, extendedInstances, importedInstances)
  connections = oe.updateConnections(connections, extendedConnections)
  allObjects = {'instances': instances, 'requiredReferences': {'connections': connections}}
  return allObjects
}

function checkIfIdAndClassParsed (idAndClassesParsed, newIdentifier, newClass) {
  if (idAndClassesParsed === undefined || idAndClassesParsed === null || idAndClassesParsed.length === 0) {
    return false
  }
  for (let i = 0; i < idAndClassesParsed.length; i++) {
    var identifier = idAndClassesParsed[i][0]
    var currentClass = idAndClassesParsed[i][1]

    if (newIdentifier === identifier && newClass === currentClass) {
      return true
    }
  }
  return false
}

function getClassDefinitionSemantics (instances, className) {
  var semantics = {}
  className = className.split('.mo')[0].replaceAll('.', path.sep).split(path.sep).slice(-1)
  for (var instance in instances) {
    if (instance.endsWith(className)) {
      var instanceInfo = instances[instance]
      if ('type' in instanceInfo) {
        if (instanceInfo.type === 'long_class_specifier' || instanceInfo.type === 'short_class_specifier') {
          var annotation = instanceInfo.annotation
          if (annotation !== null || annotation !== undefined) {
            semantics = oe.extractSemanticsFromAnnotations(annotation, instance)
          }
        }
      }
    }
  }
  return semantics
}
function getSemanticInformation (className, outputDir) {
  // [parentInstanceIdentifier, className, moFile]
  var idAndClassesToParse = [[0, className, null]]
  var idAndClassesParsed = []
  var instances = {}
  var requiredReferences = {}

  var i = 0
  var originalMoFile = className
  while (idAndClassesToParse.length !== idAndClassesParsed.length) {
    var parentInstanceIdentifier = idAndClassesToParse[i][0]
    var parentClassName = idAndClassesToParse[i][1]
    var moFile = idAndClassesToParse[i][2]

    var newAllObjects = updateAllObjectsWithExtendsImports(parentClassName, moFile, outputDir)
    var newInstances = newAllObjects.instances
    var newConnections = newAllObjects.requiredReferences.connections

    // if no semantic information, replace with class definition semantic information
    var classDefinitionSemantics = getClassDefinitionSemantics(newInstances, parentClassName)
    if (parentInstanceIdentifier === 0 && typeof (parentInstanceIdentifier) === 'number') {
      parentInstanceIdentifier = ''
      originalMoFile = ut.getMoFiles(parentClassName)[0]
    } else {
      var parentInstance = instances[parentInstanceIdentifier]
      if ('semantics' in parentInstance) {
        if (Object.keys(parentInstance.semantics).length === 0) {
          instances[parentInstanceIdentifier]['semantics'] = classDefinitionSemantics
        }
      }
      delete newInstances[parentClassName]
    }
    newInstances = updateInstancesKey(parentInstanceIdentifier, newInstances)
    newConnections = updateConnectionsIdentifiers(parentInstanceIdentifier, newConnections)

    for (var instanceIdentifier in newInstances) {
      var instanceInformation = newInstances[instanceIdentifier]
      var instanceType = instanceInformation.type
      var instanceClassName
      var within
      var fullMoFilePath

      // TODO: handle enum_list, der_class_specifier
      if (instanceType === 'element') {
        instanceClassName = instanceInformation.type_specifier
        within = instanceInformation.within
        fullMoFilePath = ut.searchPath([instanceClassName], within, originalMoFile)[0]
        // var fullMoFilePath2 = instanceInformation.fullMoFilePath

        if (!(instanceClassName.startsWith('Modelica') || instanceClassName.startsWith('Real') || instanceClassName.startsWith('Integer') || instanceClassName.startsWith('Boolean') || instanceClassName.startsWith('String') || instanceClassName.includes('CDL.'))) {
          if (!checkIfIdAndClassParsed(idAndClassesParsed, instanceIdentifier, instanceClassName)) {
            if (fullMoFilePath === undefined) {
              // TODO: handle
            } else {
              idAndClassesToParse.push([instanceIdentifier, instanceClassName, fullMoFilePath])
            }
          }
        }
      } else if (instanceType === 'short_class_specifier') {
        instanceClassName = instanceInformation.short_class_specifier_value.name
        within = instanceInformation.within
        fullMoFilePath = ut.searchPath([instanceClassName], within, originalMoFile)[0]
        if (!(instanceClassName.startsWith('Modelica') || instanceClassName.startsWith('Real') || instanceClassName.startsWith('Integer') || instanceClassName.startsWith('Boolean') || instanceClassName.startsWith('String') || instanceClassName.includes('CDL.'))) {
          if (!checkIfIdAndClassParsed(idAndClassesParsed, instanceIdentifier, instanceClassName)) {
            if (fullMoFilePath === undefined) {
              // TODO: handle
            } else {
              // TODO: check if correct
              // idAndClassesToParse.push([instanceIdentifier, parentClassName, fullMoFilePath])
            }
          }
        }
      } else if (instanceType === 'long_class_specifier') {
        // do nothing, the semantics might be important
      }
    }
    instances = Object.assign({}, instances, newInstances)
    requiredReferences = oe.updateRequiredReferences(requiredReferences, {'connections': newConnections})
    i += 1
    idAndClassesParsed.push([parentInstanceIdentifier, instanceClassName, moFile])
  }

  var content = {}
  for (var id in instances) {
    var semantics = instances[id].semantics
    for (var language in semantics) {
      if (language.split(' ').length === 3) {
        if (language.split(' ')[2] === 'text/turtle') {
          if (language in content) {
            content[language] += semantics[language].replaceAll('<cdl_instance_name>', id)
          } else {
            content[language] = semantics[language].replaceAll('<cdl_instance_name>', id)
          }
        }
      } else {
        if (language in content) {
          content[language] += String(semantics[language].replaceAll('<cdl_instance_name>', id) + '\n')
        } else {
          content[language] = String(semantics[language].replaceAll('<cdl_instance_name>', id) + '\n')
        }
      }
    }
  }
  for (language in content) {
    var languageTokens = language.split(' ')
    var outFolder
    var resourceName
    var outFileName
    var outputContent
    if (languageTokens.length === 3) {
      var metadataLanguage = languageTokens[0]
      var version = languageTokens[1]
      var format = languageTokens[2]
      if (format === 'text/turtle') {
        const resourceName = className.split('.mo')[0].split(path.sep).slice(-1)[0]
        var uri = 'https://example.org/' + resourceName + '.ttl'
        var body = content[language]
        var store = rdflib.graph()

        try {
          rdflib.parse(body, store, uri, 'text/turtle')
        } catch (err) {
          console.log(err)
        }
        outFolder = path.join(outputDir, 'objects', metadataLanguage, version, className.split('.mo')[0].split(path.sep).slice(0, -1).join(path.sep))
        outFileName = path.join(outFolder, resourceName + '.ttl')
        outputContent = store.serialize('turtle')
      }
    } else {
      var naturalLanguage = languageTokens[0]
      resourceName = className.split('.mo')[0].split(path.sep).slice(-1)[0]
      outFolder = path.join(outputDir, 'objects', naturalLanguage, className.split('.mo')[0].split(path.sep).slice(0, -1).join(path.sep))
      outFileName = path.join(outFolder, resourceName + '.txt')
      outputContent = content[language]
    }
    if (outputContent !== undefined && outputContent.length > 0) {
      if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true })
      }

      fs.writeFileSync(outFileName, outputContent)
    }
  }
}
module.exports.getSemanticInformation = getSemanticInformation
