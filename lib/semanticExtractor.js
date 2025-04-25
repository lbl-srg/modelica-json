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

  const modelicaPaths = ut.getMODELICAPATH()
  for (let i = 0; i < modelicaPaths.length; i++) {
    const modelicaPath = modelicaPaths[i]
    let tempClassName = moFile
    if (tempClassName.startsWith(modelicaPath)) {
      tempClassName = tempClassName.split(modelicaPath)[1]
    }
    while (tempClassName !== undefined && tempClassName.length !== 0) {
      const moFilePath = path.join(modelicaPath, tempClassName + '.mo')
      if (fs.existsSync(moFilePath)) {
        const allObjectsFilePath = path.join(outputDir, 'objects', tempClassName + '.json')

        if (fs.existsSync(allObjectsFilePath)) {
          return allObjectsFilePath
        }
      } else {
        // console.log("not exists ", moFilePath)
      }
      const tokens = tempClassName.split(path.sep)
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
  if (instances === null || instances === undefined || Object.keys(instances) === 0) {
    return instances
  }
  const keys = Object.keys(instances)
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
  if (connections === null || connections === undefined || Object.keys(connections) === 0) {
    return connections
  }
  const keys = Object.keys(connections)
  keys.forEach(connection => {
    const toList = connections[connection]
    const newConnection = parent + '.' + connection
    const newToList = []
    toList.forEach(to => {
      newToList.push(parent + '.' + to)
    })
    connections[newConnection] = newToList
    delete connections[connection]
  })
  return connections
}

function getRedeclarationsFromClassModification (classModifications) {
  const redeclaredInstances = {}
  let identifier
  classModifications.forEach(classModification => {
    const elementRedeclaration = classModification.element_redeclaration
    if (elementRedeclaration !== undefined && elementRedeclaration !== null) {
      const componentClause1 = elementRedeclaration.component_clause1
      const shortClassDefinition = elementRedeclaration.short_class_definition
      if (componentClause1 !== undefined && componentClause1 !== null) {
        // TODO: handle short class definition
        const typePrefix = componentClause1.type_prefix
        const typeSpecifier = componentClause1.type_specifier
        identifier = componentClause1.component_declaration1.declaration.identifier
        const annotation = componentClause1.component_declaration1.declaration.annotation
        redeclaredInstances[identifier] = {
          type_prefix: typePrefix,
          type_specifier: typeSpecifier,
          type: 'element',
          annotation,
          semantics: oe.extractSemanticsFromAnnotations(annotation, identifier)
        }
      }
      if (shortClassDefinition !== undefined && shortClassDefinition !== null) {
        const shortClassSpecifier = shortClassDefinition.short_class_specifier
        identifier = shortClassSpecifier.identifier
        const shortClassSpecifierValue = shortClassSpecifier.value
        let name = null

        if ('name' in shortClassSpecifierValue && shortClassSpecifierValue.name !== undefined) {
          name = shortClassSpecifierValue.name
          redeclaredInstances[identifier] = {
            type: 'short_class_specifier',
            type_specifier: name,
            short_class_specifier_value: shortClassSpecifierValue
          }
        } else if ('enum_list' in shortClassSpecifierValue && shortClassSpecifierValue.enum_list !== undefined) {
          const enumList = shortClassSpecifierValue.enum_list

          for (let j = 0; j < enumList.length; j++) {
            const enumListIdentifier = enumList[j].identifier
            redeclaredInstances[enumListIdentifier] = {
              type: 'enumeration',
              enumeration_literal: enumList[j]
            }
          }
        }
      }
    }
  })
  return redeclaredInstances
}

function updateAllObjectsWithExtendsImports (className, moFile, outputDir) {
  const allObjectsPath = getAllObjectsFilePathOfClass(className, moFile, outputDir)

  if (allObjectsPath === '') {
    // TODO: handle here
    return { instances: {}, requiredReferences: {} }
  }

  let allObjects = JSON.parse(fs.readFileSync(allObjectsPath, 'utf8'))
  let instances = allObjects.instances

  const allKeys = Object.keys(instances)
  allKeys.forEach(instanceIdentifier => {
    const instanceInfo = instances[instanceIdentifier]
    if (instanceInfo !== undefined && instanceInfo.type_specifier !== undefined) {
      // found instance of a class that has been defined within this mo clas
      if (instanceInfo.type_specifier in instances && instances[instanceInfo.type_specifier].type === 'long_class_specifier') {
        const newClass = instanceInfo.type_specifier
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
  const requiredReferences = allObjects.requiredReferences

  let connections = {}
  if ('connections' in requiredReferences && requiredReferences.connections !== null && requiredReferences.connections !== undefined) {
    connections = requiredReferences.connections
  }

  let importClauses = []
  if ('import_clause' in requiredReferences && requiredReferences.import_clause !== null && requiredReferences.import_clause !== undefined) {
    importClauses = importClauses.concat(requiredReferences.import_clause)
  }

  let extendedInstances = {}
  let extendedConnections = {}
  if ('extends_clause' in requiredReferences && requiredReferences.extends_clause !== undefined && requiredReferences.extends_clause !== null) {
    let extendClauses = []
    const parsedExtendClauseNames = []
    const traversedExtendClauses = []

    extendClauses = extendClauses.concat(requiredReferences.extends_clause)
    let i = 0
    while (traversedExtendClauses.length !== extendClauses.length) {
      const extendsClause = extendClauses[i]
      const extendedClassName = extendsClause.name
      const extendedClassModification = extendsClause.class_modification
      // TODO: handle annotations
      // var extendedAnnotation = extendClause.annotation
      parsedExtendClauseNames.push(extendedClassName)

      const extendedJsonFilePath = getAllObjectsFilePathOfClass(extendedClassName, null, outputDir)
      let extendedAllObjects = null
      if (fs.existsSync(extendedJsonFilePath)) {
        extendedAllObjects = JSON.parse(fs.readFileSync(extendedJsonFilePath, 'utf8'))
      } else {
        traversedExtendClauses.push(extendsClause)
        i += 1
        continue
      }

      // below extracts the allObjects from the extended class and any extends classes
      const newRequiredReferences = extendedAllObjects.requiredReferences
      if ('connections' in newRequiredReferences && newRequiredReferences.connections !== null && newRequiredReferences.connections !== undefined) {
        const newConnections = newRequiredReferences.connections
        extendedConnections = oe.updateConnections(extendedConnections, newConnections)
      }
      if ('extends_clause' in newRequiredReferences && newRequiredReferences.extends_clause !== null && newRequiredReferences.extends_clause !== undefined) {
        const extendsClause2 = newRequiredReferences.extends_clause
        if (!(extendsClause2.name in parsedExtendClauseNames)) {
          extendClauses = extendClauses.concat(extendsClause2)
        }
      }
      if ('import_clause' in newRequiredReferences && newRequiredReferences.import_clause !== null && newRequiredReferences.import_clause !== undefined) {
        importClauses = importClauses.concat(newRequiredReferences.import_clause)
      }
      const newInstances = extendedAllObjects.instances
      if (extendedClassModification !== null && extendedClassModification !== undefined) {
        const redeclaredInstances = getRedeclarationsFromClassModification(extendedClassModification)

        if (Object.keys(redeclaredInstances).length !== 0) {
          for (const key in redeclaredInstances) {
            if (key in newInstances) {
              redeclaredInstances[key].long_class_specifier_identifier = newInstances[key].long_class_specifier_identifier
              redeclaredInstances[key].within = newInstances[key].within
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

  const importedInstances = {}
  if (importClauses.length > 0) {
    for (const importClause in importClauses) {
      const importClauseIdentifier = importClause.identifier
      const importClauseName = importClause.name
      // TODO: handle importList and dotStar
      // var dotStar = importClause.dot_star
      // var importList = importClause.import_list

      if (importClauseIdentifier !== null && importClauseIdentifier !== undefined) {
        importedInstances[importClauseIdentifier] = {
          type_specifier: importClauseName,
          type: 'import_clause'
        }
      }
    }
  }

  instances = Object.assign({}, instances, extendedInstances, importedInstances)
  connections = oe.updateConnections(connections, extendedConnections)
  allObjects = { instances, requiredReferences: { connections } }
  return allObjects
}

function checkIfIdAndClassParsed (idAndClassesParsed, newIdentifier, newClass) {
  if (idAndClassesParsed === undefined || idAndClassesParsed === null || idAndClassesParsed.length === 0) {
    return false
  }
  for (let i = 0; i < idAndClassesParsed.length; i++) {
    const identifier = idAndClassesParsed[i][0]
    const currentClass = idAndClassesParsed[i][1]

    if (newIdentifier === identifier && newClass === currentClass) {
      return true
    }
  }
  return false
}

function getClassDefinitionSemantics (instances, className) {
  let semantics = {}
  className = className.split('.mo')[0].replaceAll('.', path.sep).split(path.sep).slice(-1)
  for (const instance in instances) {
    if (instance.endsWith(className)) {
      const instanceInfo = instances[instance]
      if ('type' in instanceInfo) {
        if (instanceInfo.type === 'long_class_specifier' || instanceInfo.type === 'short_class_specifier') {
          const annotation = instanceInfo.annotation
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
  const idAndClassesToParse = [[0, className, null]]
  const idAndClassesParsed = []
  let instances = {}
  let requiredReferences = {}

  let i = 0
  let originalMoFile = className
  while (idAndClassesToParse.length !== idAndClassesParsed.length) {
    let parentInstanceIdentifier = idAndClassesToParse[i][0]
    const parentClassName = idAndClassesToParse[i][1]
    const moFile = idAndClassesToParse[i][2]

    const newAllObjects = updateAllObjectsWithExtendsImports(parentClassName, moFile, outputDir)
    let newInstances = newAllObjects.instances
    let newConnections = newAllObjects.requiredReferences.connections

    // if no semantic information, replace with class definition semantic information
    const classDefinitionSemantics = getClassDefinitionSemantics(newInstances, parentClassName)
    if (parentInstanceIdentifier === 0 && typeof (parentInstanceIdentifier) === 'number') {
      parentInstanceIdentifier = ''
      originalMoFile = ut.getMoFiles(parentClassName)[0]
    } else {
      const parentInstance = instances[parentInstanceIdentifier]
      if ('semantics' in parentInstance) {
        if (Object.keys(parentInstance.semantics).length === 0) {
          instances[parentInstanceIdentifier].semantics = classDefinitionSemantics
        }
      }
      delete newInstances[parentClassName]
    }
    newInstances = updateInstancesKey(parentInstanceIdentifier, newInstances)
    newConnections = updateConnectionsIdentifiers(parentInstanceIdentifier, newConnections)

    let instanceClassName
    for (const instanceIdentifier in newInstances) {
      const instanceInformation = newInstances[instanceIdentifier]
      const instanceType = instanceInformation.type
      let within
      let fullMoFilePath

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
    requiredReferences = oe.updateRequiredReferences(requiredReferences, { connections: newConnections })
    i += 1
    idAndClassesParsed.push([parentInstanceIdentifier, instanceClassName, moFile])
  }

  const content = {}
  for (const id in instances) {
    const semantics = instances[id].semantics
    const newId = id.replaceAll('.', '_')
    for (const language in semantics) {
      if (language.split(' ').length === 3) {
        if (language.split(' ')[2] === 'text/turtle') {
          if (language in content) {
            content[language] += semantics[language].replaceAll('<cdl_instance_name>', newId)
          } else {
            content[language] = semantics[language].replaceAll('<cdl_instance_name>', newId)
          }
        }
      } else {
        if (language in content) {
          content[language] += String(semantics[language].replaceAll('<cdl_instance_name>', newId) + '\n')
        } else {
          content[language] = String(semantics[language].replaceAll('<cdl_instance_name>', newId) + '\n')
        }
      }
    }
  }
  for (const language in content) {
    const languageTokens = language.split(' ')
    let outFolder
    let resourceName
    let outFileName
    let outputContent
    if (languageTokens.length === 3) {
      const metadataLanguage = languageTokens[0]
      const version = languageTokens[1]
      const format = languageTokens[2]
      if (format === 'text/turtle') {
        const resourceName = className.split('.mo')[0].split(path.sep).slice(-1)[0]
        const uri = 'https://example.org/' + resourceName + '.ttl'
        const body = content[language]
        const store = rdflib.graph()

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
      const naturalLanguage = languageTokens[0]
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
