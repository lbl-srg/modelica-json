const path = require('path')
const fs = require('bluebird').promisifyAll(require('fs'))
const oe = require('./objectExtractor.js')
const ut = require('./util.js')
// const {execSync} = require('child_process');


/**
 * function to get path to allObjects json
 */
function getAllObjectsFilePathOfClass (className, moFile, outputDir) {
  if (moFile === null || moFile === undefined) {
    moFile = className
  }
  if (moFile.endsWith(".mo")) {
    moFile = moFile.split(".mo")[0]
  }
  moFile = moFile.replaceAll(".", path.sep)

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
function updateInstancesKey(parent, instances) {
  if (parent === undefined || parent === null || parent === "") {
    return instances
  }
  else if (parent.endsWith(".")) {
    parent = parent.slice(0,-1)
  }
  if (instances === {} || instances === undefined || Object.keys(instances) === 0) {
    return instances
  }
  Object.keys(instances).forEach(instance => {
    instances[parent+'.'+instance] = instances[instance]
    delete instances[instance] 
  })
  return instances
}

function updateAllObjectsWithExtendsImports(className, moFile, outputDir) {
  var allObjectsPath = getAllObjectsFilePathOfClass(className, moFile, outputDir)
  
  if (allObjectsPath === '') {
    // TODO: handle here
    console.log('undefined3')
    return {'instances': {}, 'requiredReferences': {}}
  }
  
  var allObjects = JSON.parse(fs.readFileSync(allObjectsPath, 'utf8'))
  var instances = allObjects.instances

  var allKeys = Object.keys(instances)
  allKeys.forEach(instanceIdentifier => {
    var instanceInfo = instances[instanceIdentifier]
    
    if (instanceInfo !== undefined && instanceInfo.type_specifier !== undefined) {
      // found instance of a class that has been defined within this mo clas
      if (instanceInfo.type_specifier in instances  && instances[instanceInfo.type_specifier].type === 'long_class_specifier') {
        var newClass = instanceInfo.type_specifier
        
        allKeys.forEach(instanceIdentifier2 => {
          if (instances[instanceIdentifier2].long_class_specifier_identifier === newClass) {
            instances[instanceIdentifier+'.'+instanceIdentifier2] = instances[instanceIdentifier2]
            delete instances[instanceIdentifier2]
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

  if ('extends_clause' in requiredReferences && requiredReferences.extends_clause !== undefined && requiredReferences.extends_clause !== null) {
    var extendsClauses = requiredReferences.extends_clause
    var extendedAllObjectsFiles = []
    extendsClauses.forEach(extendsClause => {
      var extendedFile = extendsClause.name
      var extendedJsonFilePath = getAllObjectsFilePathOfClass(extendedFile, null, outputDir)
      if (fs.existsSync(extendedJsonFilePath)) {
        extendedAllObjectsFiles = extendedAllObjectsFiles.concat([extendedJsonFilePath])
      }
    })

    var traversedAllExtendedInstancesFiles = (extendedAllObjectsFiles.length > 0) ? false: true
    var traversedExtendedAllObjectsFiles = []

    let i = 0
    while (!traversedAllExtendedInstancesFiles) {
      // console.log(extendedAllObjectsFiles.length, traversedExtendedAllObjectsFiles.length, extendedAllObjectsFiles[i])
      var extendedAllObjectsFile = extendedAllObjectsFiles[i]
      var extendedAllObjects = JSON.parse(fs.readFileSync(extendedAllObjectsFile, 'utf8'))

      var extendedRequiredReferences = extendedAllObjects['requiredReferences']
      if ('connections' in extendedRequiredReferences && extendedRequiredReferences.connections !== null && extendedRequiredReferences.connections !== undefined) {
        var extendedConnections = extendedRequiredReferences.connections
        connections = oe.updateConnections(connections, extendedConnections)
      }

      // TODO: handle redeclarations
      if ('extends_clause' in extendedRequiredReferences && extendedRequiredReferences.extends_clause !== null && extendedRequiredReferences.extends_clause !== undefined) {
        var extendsClauses2 = requiredReferences.extends_clause
        extendsClauses2.forEach(extendsClause2 => {
          var extendedFile2 = extendsClause2.name
          var extendedJsonFilePath2 = getAllObjectsFilePathOfClass(extendedFile2, outputDir)
          if (fs.existsSync(extendedJsonFilePath2) && !(extendedAllObjectsFiles.includes(extendedJsonFilePath2))) {
            extendedAllObjectsFiles = extendedAllObjectsFiles.concat([extendedJsonFilePath2])
          }
        })
      }

    // TODO: handle imports_clause

      var extendedInstances = Object.assign({}, extendedAllObjects.instances)
      instances = Object.assign({}, instances, extendedInstances)

      if (!(extendedAllObjectsFile in traversedExtendedAllObjectsFiles)) {
        traversedExtendedAllObjectsFiles = traversedExtendedAllObjectsFiles.concat([extendedAllObjectsFile])
      }
      if (traversedExtendedAllObjectsFiles.length === extendedAllObjectsFiles.length) {
        traversedAllExtendedInstancesFiles = true
      }
      i += 1
    }
  }
  // console.log(Object.keys(instances))
  allObjects = {'instances': instances, 'requiredReferences': {'connections': connections}}
  return allObjects
}

function checkIfIdAndClassParsed (idAndClassesParsed, newIdentifier, newClass) {
  if (idAndClassesParsed === undefined || idAndClassesParsed === null || idAndClassesParsed.length === 0) {
    return false
  }
  for (let i=0; i<idAndClassesParsed.length; i++) {
    var identifier = idAndClassesParsed[i][0]
    var currentClass = idAndClassesParsed[i][1]

    if (newIdentifier === identifier && newClass === currentClass) {
      return true
    }
  }
  return false
}
function getSemanticInformation (className, outputDir) {
  // [parentInstanceIdentifier, className, moFile]
  var idAndClassesToParse = [[0, className, null]]
  var idAndClassesParsed = []
  var instances = {}
  var requiredReferences = {}

  var i = 0
  while (idAndClassesToParse.length !== idAndClassesParsed.length) {
    var parentInstanceIdentifier = idAndClassesToParse[i][0]
    var parentClassName = idAndClassesToParse[i][1]
    var moFile = idAndClassesToParse[i][2]
    // console.log("parentIsntanceIdentifier = ", parentInstanceIdentifier)
    // console.log("className = ", parentClassName)
    if (parentInstanceIdentifier === 0 && typeof(parentInstanceIdentifier) === 'number') {
      parentInstanceIdentifier = ""
    } 

    // console.log("current parentId = ", parentInstanceIdentifier)
    // console.log("current class = ", className)
    var newAllObjects = updateAllObjectsWithExtendsImports(parentClassName, moFile, outputDir)
    var newInstances = newAllObjects.instances
    newInstances = updateInstancesKey(parent=parentInstanceIdentifier, newInstances=newInstances)

    for(var instanceIdentifier in newInstances) {
      var instanceInformation = newInstances[instanceIdentifier]
      var instanceType = instanceInformation.type

      // TODO: handle enum_list, der_class_specifier
      if (instanceType === 'element') {
        var parentClassName = instanceInformation.type_specifier
        var within = instanceInformation.within
        var fullMoFilePath = ut.searchPath([parentClassName], within)[0]
        var fullMoFilePath2 = instanceInformation.fullMoFilePath // TODO: this is wrong; this points to current file
  
        // TODO: check list
        if (!(parentClassName.startsWith("Modelica") || parentClassName.startsWith("Real") || parentClassName.startsWith("Integer") || parentClassName.startsWith("Boolean"))) {
          if (!checkIfIdAndClassParsed(idAndClassesParsed, newIdentifier=instanceIdentifier, newClass=parentClassName)) {
            if (fullMoFilePath === undefined) {
              // TODO: handle
              console.log("undefined2 ", parentClassName, within, fullMoFilePath2)
            } else {
              idAndClassesToParse.push([instanceIdentifier, parentClassName, fullMoFilePath])
            }
          } 
        } else {
          // console.log("typeSpecifier ", typeSpecifier)
        }
      } else if (instanceType === 'short_class_specifier') {
        var parentClassName = instanceInformation.short_class_specifier_value.name
        var within = instanceInformation.within
        var fullMoFilePath = ut.searchPath([parentClassName], within)[0]
        // TODO: check list
        if (!(parentClassName.startsWith("Modelica") || parentClassName.startsWith("Real") || parentClassName.startsWith("Integer") || parentClassName.startsWith("Boolean"))) {
          if (!checkIfIdAndClassParsed(idAndClassesParsed, newIdentifier=instanceIdentifier, newClass=parentClassName)) {
            if (fullMoFilePath === undefined) {
              // TODO: handle
              // console.log("undefined2")
            } else {
              idAndClassesToParse.push([instanceIdentifier, parentClassName, fullMoFilePath])
            }
          } 
        } else {
          // console.log("typeSpecifier ", typeSpecifier)
        }
      } else if (instanceType === 'long_class_specifier') {
        // do nothing, the semantics might be important
      }
    }
    instances = Object.assign({}, instances, newInstances)
    // TODO: handle connections
    i+=1
    idAndClassesParsed.push([parentInstanceIdentifier, parentClassName, moFile])
  }
  ut.writeFile(path.join(outputDir, "objects", "test.json"), JSON.stringify(instances))

  for (var id in instances) {
    var semantics = instances[id].semantics
    for (var language in semantics) {
      if (language.split(' ').length === 3) {
        console.log(language, 'output === ')
        console.log(semantics[language].replaceAll('<cdl_instance_name>', id))
      } else {
        // console.log(language, 'output === ')
        // console.log(semantics[language])
      }
    }
  }
}
module.exports.getSemanticInformation = getSemanticInformation
