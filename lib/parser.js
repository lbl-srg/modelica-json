'use strict'

const jq = require('../lib/jsonquery.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')
const logger = require('winston')
const fs = require('bluebird').promisifyAll(require('fs'))
const oe = require('./objectExtractor.js')
const cxfExt = require('./cxfExtractor.js')
const path = require('path')
const storedDefinition = require('../json2mo/storedDefinition')

const PRIMITIVE_TYPES = ['Real', 'Integer', 'Boolean', 'String']

/**
 * Parses moFiles and returns their JSON representations.
 *
 * With the 'raw-json' output, only 'moFiles' are parsed. With any other output, 'moFiles'
 * and all the classes they use are parsed, recursively, including the CDL elementary blocks,
 * unless 'isFollowed' leaves them out.
 *
 * The output files are written to '<directory>/<format>/', at the path given by the 'within'
 * clause and the name of each Modelica file: 'raw-json', or 'json' with any other output.
 * With the 'objects' and 'cxf' outputs, the instances and connections of each class are also
 * written to '<directory>/objects/', and with the 'cxf' output, the CXF of each class
 * is written to '<directory>/cxf/'. The CXF is not written for the classes of the Modelica
 * Standard Library, and for the CDL elementary blocks that are not in 'moFiles', unless
 * 'elementary' is true.
 *
 * The simplified JSON representation of a class is not parsed again if a file with the same
 * checksum is found in 'directory' or in one of 'cacheDirectories'.
 *
 * @param {Array<string>} moFiles - The list of Modelica files.
 * @param {Object} [options]
 * @param {string} [options.outputFormat='json'] - 'raw-json', 'json', 'objects' or 'cxf'.
 * @param {string} [options.directory='current'] - The output directory, 'current' for the current directory.
 * @param {Array<string>} [options.cacheDirectories=[]] - Other directories in which the simplified JSON
 *     representations are looked up before parsing a file. They are not written.
 * @param {boolean} [options.prettyPrint=false] - The flag indicating whether to pretty print the JSON output.
 * @param {boolean} [options.elementary=false] - With the 'cxf' output, write the CXF of the CDL elementary
 *     blocks used by the classes, in addition to the classes of 'moFiles'.
 * @param {function(string): boolean} [options.isExcluded] - Function that returns true for the names of the classes
 *     of 'moFiles' to leave out, see 'ut.getExcludeFilter'. The classes used by the other classes are always parsed,
 *     whatever their name.
 * @param {function(string): boolean} [options.isFollowed] - Function that returns false for the paths of
 *     the Modelica files of the used classes that are not parsed, nor the classes they use.
 * @returns {Array<Object>} - An array of JSON objects representing the Modelica files and all used classes.
 */
function getJsons (moFiles, {
  outputFormat = 'json',
  directory = 'current',
  cacheDirectories = [],
  prettyPrint = false,
  elementary = false,
  isExcluded = () => false,
  isFollowed = () => true
} = {}) {
  logger.debug('Entered parser.getJsons.')
  if (!['raw-json', 'json', 'objects', 'cxf'].includes(outputFormat)) {
    throw new Error(`Unknown output format ${outputFormat}.`)
  }
  const outDir = (directory === 'current') ? process.cwd() : directory

  // Register the library roots of the input files, derived from their 'within' clause, so that
  // the classes of these libraries are looked up below these roots, and not in the entries of MODELICAPATH.
  // This must be done before parsing, as the input files are parsed together with the classes they use.
  moFiles.forEach((moFile) => ut.addLibraryRoot(moFile))
  const inputFiles = moFiles.filter(moFile => !isExcluded(ut.getClassName(moFile)))

  const jsons = [] // JSON representations of the Modelica files and all used classes
  if (outputFormat === 'raw-json') {
    inputFiles.forEach((moFile) => {
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
    // Remove the temporary directory even if an error is thrown, in which case
    // the outputs that have already been generated are not copied to outDir.
    try {
      const options = {
        tempDir: tempJsonDir,
        outDir,
        cacheDirectories,
        prettyPrint,
        objects: outputFormat !== 'json',
        cxf: outputFormat === 'cxf',
        elementary,
        isFollowed
      }
      const parsedFiles = []
      inputFiles.forEach((moFile) => {
        // get JSON representation of the Modelica file and all used classes and write to file
        jsons.push(...getSimpleJson(moFile, parsedFiles, options, true))
      })

      ut.copyFolderSync(tempJsonDir, outDir)
    } finally {
      ut.removeDir(tempJsonDir)
    }
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
  checkWithin(rawJson, moFile)
  if (outputFormat === 'raw-json') {
    delete rawJson.fullMoFilePath
  }
  return rawJson
}

/**
 * Check that the 'within' clause read by scanning the file, which is used to derive the library
 * root and the paths of the output files (see 'ut.getLibrary' and 'ut.getClassPath'), is the one
 * of the parsed file.
 *
 * @param {object} rawJson - The raw JSON representation of the Modelica file.
 * @param {string} moFile - The path of the Modelica file.
 * @throws {Error} if the 'within' clauses differ
 */
function checkWithin (rawJson, moFile) {
  // No 'within' clause and 'within ;' are both represented by '' or a missing property.
  const scanned = ut.readWithin(moFile) ?? ''
  const parsed = rawJson.within ?? ''
  if (scanned !== parsed) {
    throw new Error(`The 'within' clause of ${moFile} is '${parsed}', but the file scan returned '${scanned}': ` +
      'the library root of the file, and the paths of the output files, cannot be determined.')
  }
}

/**
 * Check if a used class is followed when the controls instances of a Modelica model are exported to CXF,
 * see 'cxfExtractor.getCxfFromModelica'.
 *
 * The export only needs the model and the CDL control blocks it instantiates (directly or via an
 * extends clause). Not following the other library classes avoids parsing deep, irrelevant dependency
 * trees (e.g. Buildings.Fluid for a fan). A class is not followed when it belongs to the
 * Buildings library or the Modelica Standard Library but not to a Templates,
 * Examples or Controls package. User-defined classes are always followed.
 *
 * @param {string} filePath - path of the Modelica file of a used class.
 * @returns {boolean} - true if the class is parsed.
 */
function isFollowedForControlsExport (filePath) {
  const tokens = filePath.split(path.sep)
  const inLibrary = tokens.includes('Buildings') || tokens.includes('Modelica')
  if (!inLibrary) {
    return true
  }
  return tokens.includes('Templates') || tokens.includes('Examples') || tokens.includes('Controls')
}

/**
 * Find the simplified JSON representation of a Modelica file that has already been written,
 * with the checksum of the file.
 *
 * @param {string} moFile - The path to the Modelica file.
 * @param {string} moChecksum - The checksum of the Modelica file.
 * @param {Array<string>} dirs - The directories in which the representation is looked up, in this order.
 * @returns {{dir: string, file: string}|undefined} - The directory and the path of the representation,
 *     undefined if it is not found.
 */
function findJsonFile (moFile, moChecksum, dirs) {
  return dirs.map(dir => ({ dir, file: ut.getOutputFile(moFile, 'json', dir) }))
    .find(({ file }) => fs.existsSync(file) && !ut.checkIfParse(file, moChecksum, moFile))
}

/**
 * Generates simplified JSON representation of a Modelica file
 * and write it to file if it does not exist.
 * - This is done recursively for all used classes, see 'getJsons'.
 * - The returned array contains the simplified JSON of *all* instantiated classes,
 *   even the ones that are not parsed in this call.
 * - During this process, all parsed files are stored in the parsedFiles array.
 *
 * @param {string} moFile - The path to the Modelica file.
 * @param {Array<string>} parsedFiles - An array of paths to the parsed files.
 * @param {Object} options - The options of 'getJsons', with 'tempDir', the temporary directory
 *     to which the files are written, 'outDir', the output directory, and 'objects' and 'cxf',
 *     which indicate whether to write the instances and connections, and the CXF.
 * @param {boolean} isInput - Indicates whether the file is one of the files given to 'getJsons'.
 * @returns {Array<Object>} - An array of JSON objects representing the Modelica file and all used classes.
 */
function getSimpleJson (moFile, parsedFiles, options, isInput) {
  const { tempDir, outDir, cacheDirectories, prettyPrint, isFollowed } = options
  // find the modelica file checksum
  const moChecksum = ut.getMoChecksum(moFile)
  // The JSON file may have been written in this run, in an earlier run, or in the cache directories.
  const found = findJsonFile(moFile, moChecksum, [tempDir, outDir, ...cacheDirectories])

  const jsons = []
  if (found !== undefined) {
    const jsonOp = JSON.parse(fs.readFileSync(found.file, 'utf8'))
    // The JSON file is found by class name and checksum, so it may have been written for another
    // file with the same content, such as in another copy of the library: use the paths of this file.
    Object.assign(jsonOp, { modelicaFile: ut.getRelativePath(moFile), fullMoFilePath: moFile })
    jsons.push(jsonOp)
    // A file of the cache directories is written to the output directory.
    if (found.dir !== tempDir && found.dir !== outDir) {
      const out = prettyPrint ? JSON.stringify(jsonOp, null, 2) : JSON.stringify(jsonOp)
      ut.writeFile(ut.getOutputFile(moFile, 'json', tempDir), out)
    }
  } else {
    // if the moFile is a package.mo file, retrieve content in the package.order file
    const packageOrder = ut.getPackageOrder(moFile)
    // get the raw-json output: this process will add relative and full modelica file path to the json output
    const rawJson = getRawJson(moFile, 'json')
    Object.assign(rawJson, { checksum: moChecksum })
    const curSimJson = jq.simplifyModelicaJSON(rawJson)
    jsons.push(curSimJson)
    // write names of the class in the package, if it is a package.mo file
    if (packageOrder !== undefined) {
      jsons[0].order = packageOrder
    }
    // write the simplified json output to file
    const out = prettyPrint ? JSON.stringify(jsons[0], null, 2) : JSON.stringify(jsons[0])
    ut.writeFile(ut.getOutputFile(moFile, 'json', tempDir), out)
  }
  // store the path of the parsed file
  parsedFiles.push(moFile)

  // recursively process all instantiated files
  getInstantiatedFile(jsons[0], moFile)
    .filter(val => !parsedFiles.includes(val) && isFollowed(val))
    .forEach((element) => {
      // The file may have been parsed by the previous elements.
      if (!parsedFiles.includes(element)) {
        jsons.push(...getSimpleJson(element, parsedFiles, options, false))
      }
    })

  // generate the instances and connections, and the cxf output
  if (options.objects || options.cxf) {
    const allObjectsJson = generateAllObjectsJson(jsons[0], moFile, tempDir, prettyPrint)
    if (options.cxf) {
      generateCxf(allObjectsJson, moFile, tempDir, prettyPrint, isInput || options.elementary)
    }
  }

  // return array of JSON objects without duplicates
  return ut.getUniqueObjectsFromArray(jsons)
}

function generateAllObjectsJson (jsonOutput, moFile, tempDir, prettyPrint) {
  // instances and connections extraction
  const allObjectsJson = oe.extractAllObjects(jsonOutput, null)
  const allObjectsJsonPath = ut.getOutputFile(moFile, 'objects', tempDir)
  const allObjectsJsonOut = prettyPrint ? JSON.stringify(allObjectsJson, null, 2) : JSON.stringify(allObjectsJson)
  ut.writeFile(allObjectsJsonPath, allObjectsJsonOut)
  return allObjectsJson
}

// Top-level packages of the Modelica Standard Library (MSL), per the official
// repository: https://github.com/modelica/ModelicaStandardLibrary/tree/master/Modelica
// `SIunits` is kept for older MSL versions where it predates `Units`.
const MODELICA_STANDARD_LIBRARY_PACKAGES = new Set([
  'Blocks', 'Clocked', 'ComplexBlocks', 'ComplexMath', 'Constants',
  'Electrical', 'Fluid', 'Icons', 'Magnetic', 'Math', 'Mechanics',
  'Media', 'Resources', 'SIunits', 'StateGraph', 'Thermal', 'Units',
  'UsersGuide', 'Utilities'
])

/**
 * Heuristic check for whether a Modelica file belongs to the Modelica Standard
 * Library (MSL). The MSL root package directory is always named `Modelica`, so
 * we look for a `Modelica` path segment immediately followed by a known
 * top-level MSL package (or the root `package.mo`). Requiring the next segment
 * to be a known package avoids false positives from unrelated directories that
 * merely happen to be named `Modelica`. This inspects the absolute file path
 * and so is independent of where MODELICAPATH points.
 *
 * @param {string} moFile - The path of the Modelica file.
 * @returns {boolean} - True if the file is part of the Modelica Standard Library.
 */
function isModelicaStandardLibraryFile (moFile) {
  const tokens = moFile.split(path.sep)
  const idx = tokens.indexOf('Modelica')
  if (idx === -1) {
    return false
  }
  const next = (tokens[idx + 1] ?? '').replace(/\.mo$/, '')
  // `package` matches the Modelica root package itself (Modelica/package.mo).
  return next === 'package' || MODELICA_STANDARD_LIBRARY_PACKAGES.has(next)
}

/**
 * Write the CXF of a class.
 *
 * @param {Object} jsonOutput - The instances and connections of the class.
 * @param {string} moFile - The path to the Modelica file.
 * @param {string} tempDir - The directory to which the CXF is written.
 * @param {boolean} prettyPrint - Indicates whether the JSON output should be pretty-printed.
 * @param {boolean} elementary - Indicates whether the CXF is written if the class is a CDL elementary block.
 */
function generateCxf (jsonOutput, moFile, tempDir, prettyPrint, elementary) {
  // CXF is only generated for CDL-compliant files. Modelica Standard Library
  // classes are pulled in only to resolve types; they are not valid CDL and
  // cannot be serialized to CXF, so skip them.
  if (isModelicaStandardLibraryFile(moFile)) {
    return
  }
  const isElementaryBlock = ut.isCdlElementaryClass(ut.getClassName(moFile))
  if (isElementaryBlock && !elementary) {
    return
  }
  const blockName = path.basename(moFile, '.mo')
  const cxfGraphJsonLd = cxfExt.getCxfGraph(jsonOutput.instances, jsonOutput.requiredReferences, blockName, elementary, false)
  // The classes of the CDL package are written even if their graph is empty, as they are merged into CXF-Core.jsonld.
  if (moFile.split('.mo')[0].split(path.sep).includes('CDL') ||
    (cxfGraphJsonLd !== undefined && cxfGraphJsonLd !== null && Object.keys(cxfGraphJsonLd).length > 0)) {
    const out = prettyPrint ? JSON.stringify(cxfGraphJsonLd ?? {}, null, 2) : JSON.stringify(cxfGraphJsonLd ?? {})
    ut.writeFile(ut.getOutputFile(moFile, 'cxf', tempDir), out)
  }
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
    const { pubEleLis, proEleLis } = getElementLists(comp)
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
 * Check if a file is left out of the validation, see 'cdlCompliance.checkCdlCompliance':
 * CDL elementary blocks are exempt from the check of CDL compliance, and users guides only contain documentation.
 *
 * @param {string} moFile path of the Modelica file
 * @returns {boolean} true if the file is left out
 */
function isLeftOutOfCdlCheck (moFile) {
  return ut.isCdlElementaryClass(ut.getClassName(moFile)) || moFile.includes('UsersGuide')
}

/**
 * Get the public and protected elements of a composition
 *
 * @param comp composition object
 * @returns {{pubEleLis: Array, proEleLis: Array}} public and protected elements
 */
function getElementLists (comp) {
  const pubEleLis = []
  const proEleLis = []
  const eleSec = comp.element_sections
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
  Array.prototype.push.apply(pubEleLis, comp.element_list)
  return { pubEleLis, proEleLis }
}

/**
 * Get the names of the classes used by a class, as written in the class.
 * These include the classes it extends, but not the primitive types.
 *
 * @param {Object} data simplified JSON representation of a Modelica file
 * @returns {string[]} class names, without duplicates
 */
function getUsedClassNames (data) {
  const names = data.stored_class_definitions.flatMap((claDef) => {
    const comp = claDef.class_specifier.long_class_specifier?.composition
    if (!comp) {
      return []
    }
    const { pubEleLis, proEleLis } = getElementLists(comp)
    return Object.values(searchInstances(pubEleLis.concat(proEleLis))).flat()
  })
  return [...new Set(names)].filter(name => !PRIMITIVE_TYPES.includes(name))
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
 * Get the path of the Modelica file of a class, relative to the root of its library,
 * from its simplified JSON representation: 'A/B/C.mo' for class 'A.B.C',
 * or 'A/B/C/package.mo' if the class was stored in a 'package.mo' file.
 *
 * @param {Object} json simplified JSON representation of a Modelica file
 * @returns {string} relative path
 */
function getClassPathFromJson (json) {
  const specifier = json.stored_class_definitions[0].class_specifier
  const identifier = (specifier.long_class_specifier ?? specifier.short_class_specifier ?? specifier.der_class_specifier).identifier
  const packages = json.within ? json.within.split('.') : []
  return (path.basename(json.modelicaFile ?? '') === 'package.mo')
    ? path.join(...packages, identifier, 'package.mo')
    : path.join(...packages, `${identifier}.mo`)
}

/**
 * Converts json file to modelica output, written to '<outDir>/modelica/<class path>',
 * see 'getClassPathFromJson'.
 *
 * @param jsonFile path to json file to be converted
 * @param outDir output directory, 'current' for the current directory
 * @param rawJson if true, json file is a raw-json output, written to '<outDir>/modelica/<name of jsonFile>.mo';
 *     else simplified json output
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
  const moOutput = storedDefinition.parse(jsonOutput, rawJson)

  // find the output file path
  const classPath = rawJson ? path.basename(jsonFile).replace(/\.json$/, '.mo') : getClassPathFromJson(jsonOutput)
  const outputFileName = path.join((outDir === 'current') ? process.cwd() : outDir, 'modelica', classPath)
  ut.writeFile(outputFileName, moOutput)
  return moOutput
}

module.exports.getJsons = getJsons
module.exports.convertToModelica = convertToModelica
module.exports.getElementLists = getElementLists
module.exports.isLeftOutOfCdlCheck = isLeftOutOfCdlCheck
module.exports.getUsedClassNames = getUsedClassNames
module.exports.getUsedFiles = getInstantiatedFile
module.exports.isFollowedForControlsExport = isFollowedForControlsExport
