const jq = require('../lib/jsonquery.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')
var logger = require('winston')
const fs = require('bluebird').promisifyAll(require('fs'))

const storedDefiniton = require('../json2mo/storedDefiniton')

/** 
 * Run the parser for the top-level `moFiles`,
 * and returns the JSON representations
 *
  *@param moFiles Array of mo files to be parsed
  *@param parseMode Paring mode, 'cdl' or 'modelica'
  *@param outputFormat Output format, 'raw-json', 'json', 'html' or 'docx'
  *@param directory Specified output directory
  *@param prettyPrint Flag to indicate if prettify JSON output
  *@return parsed json data array
  */
function getJsons (moFiles, parseMode, outputFormat, directory, prettyPrint) {
  logger.debug('Entered parser.getJsons.')
  var jsonData = []
  var outDir = directory
  if (directory === 'current') {
    outDir = process.cwd()
  }
  if (outputFormat === 'raw-json') {
    moFiles.forEach(function (obj) {
      // find the output file path
      var outputFileName = ut.getOutputFile(obj, 'raw-json', outDir)
      // find the modelica file checksum
      var resChecksum = ut.getMoChecksum(obj)
      // check if the file should be parsed
      var needParsed = ut.checkIfParse(outputFileName, resChecksum, obj)
      if (needParsed) {
        var rawJson = getRawJson(obj, outputFormat)
        Object.assign(rawJson, {'checksum': resChecksum})
        var out = (prettyPrint === 'true') ? JSON.stringify(rawJson, null, 2) : JSON.stringify(rawJson)
        ut.writeFile(outputFileName, out)
      }
    })
  } else {
    const tempJsonDir = ut.createTempDir('json')
    var parsedFile = []
    for (var i = 0; i < moFiles.length; i++) {
      var fileList = getSimpleJson(moFiles[i], parseMode, tempJsonDir, parsedFile, outDir, prettyPrint)
      parsedFile.push(fileList)
    }
    ut.copyFolderSync(tempJsonDir, directory)
    ut.removeDir(tempJsonDir)
  }
  return jsonData
}

/**
 * Get the raw json output
 *
 * @param moFile modelica file path
 * @param outputFormat output format
 */
function getRawJson (moFile, outputFormat) {
  const rawJson = mj.toJSON(moFile)
  if (outputFormat === 'raw-json') {
    delete rawJson['fullMoFilePath']
  }
  return rawJson
}

/**
 * Write the simplified json output to file
 *
 * @param moFile modelica file path
 * @param parseMode parsing mode, 'cdl' or 'modelica'
 * @param tempDir temporary directory to stored the json output
 * @param parsedFile list of parsed modelica files
 * @param outDir directory to store the output files
 *@param prettyPrint Flag to indicate if prettify JSON output
 */
function getSimpleJson (moFile, parseMode, tempDir, parsedFile, outDir, prettyPrint) {
  var outputFileName = ut.getOutputFile(moFile, 'json', outDir)
  // find the modelica file checksum
  var moChecksum = ut.getMoChecksum(moFile)
  // check if the file should be parsed
  var needParsed = ut.checkIfParse(outputFileName, moChecksum, moFile)
  // if the moFile has been parsed and the original moFile has no change
  if (!needParsed || parsedFile.includes(moFile)) {
    return null
  }
  // get the raw-json output, this process will add relative and full modelica file path to the json output
  var rawJson = getRawJson(moFile, 'json')
  Object.assign(rawJson, {'checksum': moChecksum})
  var da = jq.simplifyModelicaJSON(rawJson, parseMode)
  // create temp directory to host the json output before adding the svg contents
  var tempJsonPath = ut.getOutputFile(moFile, 'json', tempDir)
  // write the simplified json output to file
  var out = (prettyPrint === 'true') ? JSON.stringify(da, null, 2) : JSON.stringify(da)
  ut.writeFile(tempJsonPath, out)
  // add the full path to the list
  var parsedPath = da.fullMoFilePath
  parsedFile.push(parsedPath)
  // get list of mo files instantiated by current mo file
  var instantiateClass = getInstantiatedFile(da)
  if (instantiateClass.length > 0) {
    instantiateClass.forEach(function (obj) {
      if (!parsedFile.includes(obj)) {
        parsedFile.push(getSimpleJson(obj, parseMode, tempDir, parsedFile, outDir))
      }
    })
  }
  return parsedPath
}

/**
 * Get array of instantiated classes
 *
 * @param data simplied json output
 */
function getInstantiatedFile (data) {
  const within = data.within
  const claDef = data.class_definition
  var insCla = []
  claDef.forEach(function (obj) {
    var claLis = instantiatedClass(within, obj)
    if (claLis) {
      Array.prototype.push.apply(insCla, claLis)
    }
  })
  if (insCla.length > 0) {
    insCla = insCla.filter(function (item, pos) { return insCla.indexOf(item) === pos })
  }
  return insCla
}

/**
 * Get the array of instantiated classes in class_definition
 *
 * @param within value of within object
 * @param claDef class_definition object
 */
function instantiatedClass (within, claDef) {
  const claSpe = claDef.class_specifier
  const longCla = claSpe.long_class_specifier
  if (longCla) {
    const comp = longCla.composition
    if (!comp) {
      return null
    }
    const iniEleLis = comp.element_list
    const eleSec = comp.element_sections
    // Find public and protected element
    const pubEleLis = []
    const proEleLis = []
    if (eleSec) {
      eleSec.forEach(function (obj) {
        const temPub = obj.public_element_list
        const temPro = obj.protected_element_list
        if (temPub) {
          Array.prototype.push.apply(pubEleLis, temPub)
        }
        if (temPro) {
          Array.prototype.push.apply(proEleLis, temPro)
        }
      })
    }
    // All public element list
    Array.prototype.push.apply(pubEleLis, iniEleLis)
    // Find all instantiated classes
    const pubInstances = (pubEleLis.length > 0) ? searchInstances(pubEleLis) : null
    const proInstances = (proEleLis.length > 0) ? searchInstances(proEleLis) : null
    // Find all instantiated classes file path
    const pubInstancesFile = pubInstances ? instanceFilePath(pubInstances, within) : []
    const proInstancesFile = proInstances ? instanceFilePath(proInstances, within) : []
    var instantitatedFiles = pubInstancesFile.concat(proInstancesFile)
    // iteratively remove duplicate elements
    if (instantitatedFiles.length > 0) {
      instantitatedFiles = instantitatedFiles.filter(function (item, pos) { return instantitatedFiles.indexOf(item) === pos })
      return instantitatedFiles
    } else {
      return null
    }
  } else {
    return null
  }
}

/**
 * Return list of the path of the instantiated classes
 *
 * @param claObj object of instantiated classes
 * @param within value of within object
 */
function instanceFilePath (claObj, within) {
  var fullList = []
  const impCla = claObj.import_instance
  const extCla = claObj.extends_instance
  const conCla = claObj.constrained_instance
  const comCla = claObj.component_instance
  const insInMod = claObj.instance_in_modification
  Array.prototype.push.apply(fullList, impCla)
  Array.prototype.push.apply(fullList, extCla)
  Array.prototype.push.apply(fullList, conCla)
  Array.prototype.push.apply(fullList, comCla)
  Array.prototype.push.apply(fullList, insInMod)
  // iteratively remove duplicate elements
  fullList = fullList.filter(function (item, pos) { return fullList.indexOf(item) === pos })
  // search file full path
  const filePath = ut.searchPath(fullList, within)
  return filePath
}

/**
 * Return the array of instantiated classes
 *
 * @param eleLis element_list object
 */
function searchInstances (eleLis) {
  // imported instances
  const impEle = []
  // extends instances
  const extEle = []
  // constrained clause instances
  const conEle = []
  // component instances
  const comEle = []
  // replacable class in class modification
  const claModEle = []
  eleLis.forEach(function (ele) {
    const importCla = ele.import_clause
    if (importCla) { impEle.push(importCla.name) }
    const extendsCla = ele.extends_clause
    if (extendsCla) {
      Array.prototype.push.apply(extEle, extenedConstrainedClause(extendsCla))
    }
    const constrainingCla = ele.constraining_clause
    if (constrainingCla) {
      Array.prototype.push.apply(conEle, extenedConstrainedClause(constrainingCla))
    }
    const componentCla = ele.component_clause
    if (componentCla) {
      comEle.push(componentCla.type_specifier)
      const comList = componentCla.component_list
      comList.forEach(function (obj) {
        if (obj.declaration.modification && obj.declaration.modification.class_modification) {
          Array.prototype.push.apply(claModEle, classInModification(obj.declaration.modification.class_modification))
        }
      })
    }
  })
  return Object.assign(
    {'import_instance': impEle},
    {'extends_instance': extEle},
    {'constrained_instance': conEle},
    {'component_instance': comEle},
    {'instance_in_modification': claModEle}
  )
}

/**
 * Return the array of instantiated class by extends and constrained_clause
 *
 * @param extConCla extends or constrained_clause object
 */
function extenedConstrainedClause (extConCla) {
  const eleLis = []
  eleLis.push(extConCla.name)
  if (extConCla.class_modification) {
    Array.prototype.push.apply(eleLis, classInModification(extConCla.class_modification))
  }
  return eleLis
}

/**
 * Return the array of instantiated class by the class_modification
 *
 * @param claMod class_modification object
 */
function classInModification (claMod) {
  const claModEle = []
  if (claMod !== '()') {
    claMod.forEach(function (ele) {
      const eleModRep = ele.element_modification_or_replaceable
      if (eleModRep && eleModRep.element_replaceable) {
        Array.prototype.push.apply(claModEle, elementReplaceable(eleModRep.element_replaceable))
      }
      const eleRed = ele.element_redeclaration
      if (eleRed) {
        const eleComCla1 = eleRed.component_clause1
        if (eleComCla1) {
          claModEle.push(eleComCla1.type_specifier)
        }
        const eleRep = eleRed.element_replaceable
        if (eleRep) {
          Array.prototype.push.apply(claModEle, elementReplaceable(eleRep))
        }
      }
    })
  }
  return claModEle
}

/**
 * Return the array of instantiated class by the element_replaceable
 *
 * @param eleRep element_replaceable object
 */
function elementReplaceable (eleRep) {
  const eleLis = []
  const comCla1 = eleRep.component_clause1
  const conCla = eleRep.constraining_clause
  if (comCla1) { eleLis.push(comCla1.type_specifier) }
  if (conCla) { eleLis.push(conCla.name) }
  return eleLis
}

/**
 * Converts json file to modelica output
 * @param jsonFile path to json file to be converted
 * @param rawJson if true, json file is a raw-json output; else simplified json output
 * @returns string content of modelica file
 */
function convertToModelica (jsonFile, outDir, rawJson = false) {
  var fileContent = fs.readFileSync(jsonFile, 'utf8')

  var jsonOutput
  if (rawJson) {
    jsonOutput = JSON.parse(fileContent)[0]
  } else {
    jsonOutput = JSON.parse(fileContent)
  }
  var moOutput = storedDefiniton.parse(jsonOutput, rawJson)

  // find the output file path
  var outputFileName = ut.getOutputFile(jsonFile, 'modelica', outDir)
  ut.writeFile(outputFileName, moOutput)
  return moOutput
}

module.exports.getJsons = getJsons
module.exports.convertToModelica = convertToModelica
