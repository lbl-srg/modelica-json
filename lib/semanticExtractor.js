const path = require('path')
const fs = require('bluebird').promisifyAll(require('fs'))
const oe = require('./objectExtractor.js')
const ut = require('./util.js')

function getAllObjectsFilePathOfClass (className, outputDir) {
  className = className.split('.mo')[0]

  var modelicaPaths = ut.getMODELICAPATH()
  for (let i = 0; i < modelicaPaths.length; i++) {
    var modelicaPath = modelicaPaths[i]
        // var subDirectories = fs.readdirSync(modelicaPath, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name).filter(dirent => !dirent.startsWith("."))
    var tempClassName = className
    while (tempClassName !== '.mo' && tempClassName !== undefined && tempClassName.length !== 0) {
      var moFilePath = path.join(modelicaPath, tempClassName.replaceAll('.', path.sep) + '.mo')
      if (fs.existsSync(moFilePath)) {
        var allObjectsFilePath = path.join(outputDir, 'instances', tempClassName.replaceAll('.', path.sep) + '.json')
                // console.log(moFilePath, instancesFilePath)
        if (fs.existsSync(allObjectsFilePath)) {
          return allObjectsFilePath
        }
      } else {
                // console.log("not exists ", moFilePath)
      }
      var tokens = tempClassName.split('.')
      tokens.pop()
      tempClassName = tokens.join('.')
    }
  }
  return ''

    // if not os.path.exists(os.path.join(self.modelica_path, model_path)):
    //     while not os.path.exists(os.path.join(self.modelica_path, model_path)) and model_path!=".mo":
    //         # print("model_path {} does not exist".format(model_path))
    //         model_path = os.sep.join(model_path.split(os.sep)[:-1])+".mo"
    //         top_level = False
}

function getSemanticInformation (moFile, outputDir) {
  var jsonPath = getAllObjectsFilePathOfClass(moFile, outputDir)
  var allObjects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  var instances = allObjects.instances
  var semantics = {}
  var connections = {}
  var requiredReferences = allObjects.requiredReferences
  if ('connections' in requiredReferences && requiredReferences.connections !== null && requiredReferences.connections !== undefined) {
    connections = requiredReferences.connections
  }

  if ('extends_clause' in requiredReferences && requiredReferences.extends_clause !== undefined && requiredReferences.extends_clause !== null) {
    var extendsClauses = requiredReferences.extends_clause
    var extendedAllObjectsFiles = []
    extendsClauses.forEach(extendsClause => {
      var extendedFile = extendsClause.name
      var extendedJsonFilePath = getAllObjectsFilePathOfClass(extendedFile, outputDir)
      if (fs.existsSync(extendedJsonFilePath)) {
        extendedAllObjectsFiles = extendedAllObjectsFiles.concat([extendedJsonFilePath])
      }
    })

    var traversedAllExtendedInstancesFiles = false
    var traversedExtendedAllObjectsFiles = []

    let i = 0
    while (!traversedAllExtendedInstancesFiles) {
      var extendedAllObjectsFile = extendedAllObjectsFiles[i]
      var extendedAllObjects = JSON.parse(fs.readFileSync(extendedAllObjectsFile, 'utf8'))

      var extendedRequiredReferences = extendedAllObjects['requiredReferences']
      if ('connections' in extendedRequiredReferences && extendedRequiredReferences.connections !== null && extendedRequiredReferences.connections !== undefined) {
        var extendedConnections = extendedRequiredReferences.connections
        connections = oe.updateConnections(connections, extendedConnections)
      }

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

    // var classesToParse = {}
    // for (var instanceIdentifier in instances) {
    //     var instanceInformation = instances[instanceIdentifier]
    //     if (instanceIdentifier !== 'required_references') {
    //         var semanticInfo = instanceInformation.semantics
    //         var instanceType = instanceInformation.type

    //         if (instanceType === 'element') {
    //             var typeSpecifier = instanceInformation.type_specifier
    //             // console.log(typeSpecifier)

    //             // TODO: check list
    //             if (!(typeSpecifier.startsWith("Modelica") || typeSpecifier.startsWith("Real") || typeSpecifier.startsWith("Integer"))) {
    //                 if (instanceIdentifier in classesToParse) {
    //                     classesToParse[instanceIdentifier] = classesToParse[instanceIdentifier].concat([typeSpecifier])
    //                 } else {
    //                     classesToParse[instanceIdentifier] = [typeSpecifier]
    //                 }
    //             }
    //         }

    //         // TODO: overwrite class_definition annotation
    //         if (semanticInfo !== null && semanticInfo !== undefined && Object.keys(semanticInfo).length !== 0) {
    //             for (var language in semanticInfo) {
    //                 if (!(language in semantics)) {
    //                     semantics[language] = semanticInfo[language]
    //                 } else {
    //                     semantics[language] = semantics[language] + semanticInfo[language]
    //                 }
    //             }
    //         }
    //     }
    // }

    // for (var instanceIdentifier in classesToParse) {
    //     var typeSpecifiers = classesToParse[instanceIdentifier]
    //     typeSpecifiers.forEach(typeSpecifier => {
    //         // console.log(instanceIdentifier, typeSpecifier, checkAndReturnInstancesFilePathOfClass(typeSpecifier, outputDir))
    //     })
    // }
  for (var language in semantics) {
    if (language.split(' ').length === 3) {
      console.log(language, 'output === ')
      console.log(semantics[language])
    } else {
      console.log(language, 'output === ')
      console.log(semantics[language])
    }
  }
}
module.exports.getSemanticInformation = getSemanticInformation
