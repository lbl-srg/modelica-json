const jq = require('../lib/jsonquery.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')
const logger = require('winston')
const fs = require('bluebird').promisifyAll(require('fs'))
const oe = require('./objectExtractor.js')
const cxfExt = require('./cxfExtractor.js')
const path = require('path')

const storedDefiniton = require('../json2mo/storedDefiniton')

/**
 * Parses moFiles and returns their JSON representations.
 *
 * @param {Array<string>} moFiles - The list of Modelica files.
 * @param {string} outputFormat - The output format.
 * @param {string} directory - The output directory.
 * @param {boolean} prettyPrint - The flag indicating whether to pretty print the JSON output.
 * @param {boolean} [generateElementary=false] - The flag indicating whether to generate elementary JSON.
 * @param {boolean} [generateCxfCore=false] - The flag indicating whether to generate CXF core JSON.
 * @returns {Array<Object>} - An array of JSON objects representing the Modelica files and all used classes.
 */
function getJsons (moFiles, outputFormat, directory, prettyPrint, generateElementary = false, generateCxfCore = false) {
  logger.debug('Entered parser.getJsons.')
  const outDir = (directory === 'current') ? process.cwd() : directory

  const jsons = [] // JSON representations of the Modelica files and all used classes
  if (outputFormat === 'raw-json') {
    moFiles.forEach((moFile) => {
      // find the output file path
      const outputFileName = ut.getOutputFile(moFile, 'raw-json', outDir)
      // find the modelica file checksum
      const resChecksum = ut.getMoChecksum(moFile)
      // check if the file needs to be parsed
      const needParsed = ut.checkIfParse(outputFileName, resChecksum, moFile)
      if (needParsed) {
        const rawJson = getRawJson(moFile, outputFormat)
        Object.assign(rawJson, { checksum: resChecksum })
        jsons.push(rawJson)
        // write to file
        const out = prettyPrint ? JSON.stringify(rawJson, null, 2) : JSON.stringify(rawJson)
        ut.writeFile(outputFileName, out)
      }
    })
  } else {
    const tempJsonDir = ut.createTempDir('json')
    const parsedFiles = []
    moFiles.forEach((moFile) => {
      if ((outputFormat === 'cxf' && generateCxfCore && !moFile.split(path.sep).includes('Validation')) ||
        (outputFormat === 'cxf' && !generateCxfCore) ||
        (outputFormat !== 'cxf')) {
        // get JSON representation of the Modelica file and all used classes and write to file
        jsons.push(
          ...getSimpleJson(moFile, tempJsonDir, parsedFiles, outDir, prettyPrint, outputFormat, generateElementary, generateCxfCore)
        )
      }
    })

    ut.copyFolderSync(tempJsonDir, outDir)
    ut.removeDir(tempJsonDir)
  }

  // return array of JSON objects without duplicates
  if (moFiles.length > 1) {
    return ut.getUniqueObjectsFromArray(jsons)
  } else { // if only one file is processed, getSimpleJson already provides unique objects
    return jsons
  }
}

/**
 * Generates raw JSON representation of a Modelica file.
 *
 * @param {string} moFile - The path of the Modelica file.
 * @param {string} outputFormat - The desired output format.
 * @returns {object} - The raw JSON representation of the Modelica file.
 */
function getRawJson (moFile, outputFormat) {
  const rawJson = mj.toJSON(moFile)
  if (outputFormat === 'raw-json') {
    delete rawJson.fullMoFilePath
  }
  return rawJson
}

/**
 * Generates simplified JSON representation of a Modelica file
 * and write it to file if it does not exist.
 * - This is done recursively for all used classes.
 * - The returned array contains the simplified JSON of *all* instantiated classes,
 *   even the ones that are not parsed in this call.
 * - During this process, all parsed files are stored in the parsedFiles array.
 *
 * @param {string} moFile - The path to the Modelica file.
 * @param {string} tempDir - The temporary directory to store intermediate JSON files.
 * @param {Array<string>} parsedFiles - An array of paths to the parsed files.
 * @param {string} outDir - The output directory for the JSON files.
 * @param {boolean} prettyPrint - Indicates whether the JSON output should be pretty-printed.
 * @param {string} outputFormat - The output format for the generated files.
 * @param {boolean} generateElementary - Indicates whether to generate elementary JSON files.
 * @param {boolean} generateCxfCore - Indicates whether to generate CXF core files.
 * @returns {Array<Object>} - An array of JSON objects representing the Modelica file and all used classes.
 */
function getSimpleJson (moFile, tempDir, parsedFiles, outDir, prettyPrint, outputFormat, generateElementary, generateCxfCore) {
  // find the modelica file checksum
  const moChecksum = ut.getMoChecksum(moFile)
  // check if the file should be parsed
  const needParsed = ut.checkIfParse(ut.getOutputFile(moFile, 'json', outDir), moChecksum, moFile)
  // if the file does not need to be parsed, the JSON file can be found in outDir, otherwise create or find it in tempDir
  const outputFileName = (needParsed) ? ut.getOutputFile(moFile, 'json', tempDir) : ut.getOutputFile(moFile, 'json', outDir)

  const jsons = []
  // if the original moFile has no change or the moFile has already been parsed
  if (!needParsed || parsedFiles.includes(moFile)) {
    const jsonOp = JSON.parse(fs.readFileSync(outputFileName, 'utf8'))
    jsons.push(jsonOp)
    parsedFiles.push(jsonOp.fullMoFilePath)
  } else {
    // get the raw-json output: this process will add relative and full modelica file path to the json output
    const rawJson = getRawJson(moFile, 'json')
    Object.assign(rawJson, { checksum: moChecksum })
    jsons.push(jq.simplifyModelicaJSON(rawJson))
    // write the simplified json output to file
    const out = prettyPrint ? JSON.stringify(jsons[0], null, 2) : JSON.stringify(jsons[0])
    ut.writeFile(outputFileName, out)
    // store the path of the parsed file
    parsedFiles.push(jsons[0].fullMoFilePath)
  }

  // recursively process all instantiated files
  const instantiatedClasses = getInstantiatedFile(jsons[0], moFile)
  const newInstantiatedClasses = instantiatedClasses.filter(function (val) {
    return parsedFiles.indexOf(val) === -1
  })
  if (newInstantiatedClasses !== undefined && newInstantiatedClasses !== null && newInstantiatedClasses.length > 0) {
    newInstantiatedClasses.forEach((element) => {
      jsons.push(
        ...getSimpleJson(element, tempDir, parsedFiles, outDir, prettyPrint, outputFormat, generateElementary, generateCxfCore)
      )
    })
  }

  // generate cxf output
  if (outputFormat === 'semantic' || outputFormat === 'cxf') {
    const allObjectsJson = generateAllObjectsJson(jsons[0], moFile, tempDir, prettyPrint)
    if (outputFormat === 'cxf') {
      generateCxf(allObjectsJson, moFile, tempDir, prettyPrint, generateElementary, generateCxfCore)
    }
  }

  // return array of JSON objects without duplicates
  return ut.getUniqueObjectsFromArray(jsons)
}

function generateAllObjectsJson (jsonOutput, moFile, tempDir, prettyPrint) {
  // instances and connections extraction
  const allObjectsJson = oe.extractAllObjects(jsonOutput)
  const allObjectsJsonPath = ut.getOutputFile(moFile, 'objects', tempDir)
  const allObjectsJsonOut = prettyPrint ? JSON.stringify(allObjectsJson, null, 2) : JSON.stringify(allObjectsJson)
  ut.writeFile(allObjectsJsonPath, allObjectsJsonOut)
  return allObjectsJson
}

function generateCxf (jsonOutput, moFile, tempDir, prettyPrint, generateElementary, generateCxfCore) {
  const fileNameTokens = moFile.split('.mo')[0].split(path.sep)
  let outputFilePath
  if (fileNameTokens.includes('CDL')) {
    let cxfGraphJsonLd
    if (generateCxfCore || generateElementary) {
      // TODO: handle this
      const instances = jsonOutput.instances
      const requiredReferences = jsonOutput.requiredReferences
      const blockName = moFile.split(path.sep)[moFile.split(path.sep).length - 1].split('.mo')[0]
      cxfGraphJsonLd = Object.assign({}, cxfGraphJsonLd, cxfExt.getCxfGraph(instances, requiredReferences, blockName, generateElementary, generateCxfCore))
    }
    if (cxfGraphJsonLd !== undefined && cxfGraphJsonLd !== null) {
      const cxfCoreGraphJsonLdOut = prettyPrint ? JSON.stringify(cxfGraphJsonLd, null, 2) : JSON.stringify(cxfGraphJsonLd)
      const cxfCorePath = ut.getOutputFile(moFile, 'cxf', tempDir)
      ut.writeFile(cxfCorePath, cxfCoreGraphJsonLdOut)
      outputFilePath = cxfCorePath
    }
  } else {
    const instances = jsonOutput.instances
    const requiredReferences = jsonOutput.requiredReferences
    const blockName = moFile.split(path.sep)[moFile.split(path.sep).length - 1].split('.mo')[0]
    const cxfGraphJsonLd = cxfExt.getCxfGraph(instances, requiredReferences, blockName, generateElementary, generateCxfCore)
    if (cxfGraphJsonLd !== undefined && cxfGraphJsonLd !== null) {
      const cxfGraphJsonLdOut = prettyPrint ? JSON.stringify(cxfGraphJsonLd, null, 2) : JSON.stringify(cxfGraphJsonLd)
      const cxfPath = ut.getOutputFile(moFile, 'cxf', tempDir)
      ut.writeFile(cxfPath, cxfGraphJsonLdOut)
      outputFilePath = cxfPath
    } else {
      // TODO: only extract CDL instances
      // console.log(`${moFile} not a valid CDL file. Not generating CXF`)
    }
  }
  return outputFilePath
}

/**
 * Get array of instantiated classes
 *
 * @param data simplied json output
 */
function getInstantiatedFile (data, moFile) {
  const within = data.within
  const claDef = data.stored_class_definitions
  let insCla = []
  claDef.forEach(function (obj) {
    const claLis = instantiatedClass(within, obj, moFile)
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
function instantiatedClass (within, claDef, moFile) {
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
    const pubInstancesFile = pubInstances ? instanceFilePath(pubInstances, within, moFile) : []
    const proInstancesFile = proInstances ? instanceFilePath(proInstances, within, moFile) : []
    let instantitatedFiles = pubInstancesFile.concat(proInstancesFile)
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
 * @returns list of the file paths of the instantiated classes
 */
function instanceFilePath (claObj, within, moFile) {
  let fullList = []
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
  const filePath = ut.searchPath(fullList, within, moFile)
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
    { import_instance: impEle },
    { extends_instance: extEle },
    { constrained_instance: conEle },
    { component_instance: comEle },
    { instance_in_modification: claModEle }
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
  const fileContent = fs.readFileSync(jsonFile, 'utf8')

  let jsonOutput
  if (rawJson) {
    jsonOutput = JSON.parse(fileContent)[0]
  } else {
    jsonOutput = JSON.parse(fileContent)
  }
  const moOutput = storedDefiniton.parse(jsonOutput, rawJson)

  // find the output file path
  const outputFileName = ut.getOutputFile(jsonFile, 'modelica', outDir)
  ut.writeFile(outputFileName, moOutput)
  return moOutput
}

module.exports.getJsons = getJsons
module.exports.convertToModelica = convertToModelica
