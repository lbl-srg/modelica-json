const jq = require('../lib/jsonquery.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')
const logger = require('winston')
const fs = require('bluebird').promisifyAll(require('fs'))
const oe = require('./objectExtractor.js')
const cxfExt = require('./cxfExtractor.js')
const path = require('path')
const storedDefinition = require('../json2mo/storedDefinition')

let warnCounter = 0

/**
 * Parses moFiles and returns their JSON representations.
 *
 * @param {Array<string>} moFiles - The list of Modelica files.
 * @param {string} outputFormat - The output format.
 * @param {string} directory - The output directory.
 * @param {boolean} prettyPrint - The flag indicating whether to pretty print the JSON output.
 * @param {boolean} [generateElementary=false] - The flag indicating whether to generate elementary JSON.
 * @param {boolean} [generateCxfCore=false] - The flag indicating whether to generate CXF core JSON.
 * @param {string} mode - Indicates whether to parse a 'cdl' (default) or 'modelica' file with outputFormat='cxf'.
 * @param {string} [valueProp] - Path of the user supplied parameter values, either
 *     a JSON file or a directory holding one JSON file per sequence. The values
 *     it holds take precedence over the bindings declared in the Modelica source
 * @param {boolean} [evaluateExpressions=false] - Whether the expressions a class
 *     declares are resolved to literal values. See `generateAllObjectsJson`.
 * @param {boolean} [flattenArrays=false] - The flag indicating whether arrays are
 *     expanded into one component per element. See `generateAllObjectsJson`.
 * @returns {Array<Object>} - An array of JSON objects representing the Modelica files and all used classes.
 */
function getJsons (moFiles, outputFormat, directory, prettyPrint, generateElementary = false, generateCxfCore = false, mode = 'cdl', valueProp = null, evaluateExpressions = false, flattenArrays = false) {
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
    const parsedFiles = [] // keeps a file from being read twice
    const parsedClasses = new Map() // the Modelica classes that have been parsed
    
    // temporary directory for storing intermediate JSON files
    const parsedJsons = new Map()

    moFiles.forEach((moFile) => {
      if ((outputFormat === 'cxf' && generateCxfCore && !moFile.split(path.sep).includes('Validation')) ||
        (outputFormat === 'cxf' && !generateCxfCore) ||
        (outputFormat !== 'cxf')) {
        // get JSON representation of the Modelica file and all used classes and write to file
        const simJson = getSimpleJson(moFile, tempJsonDir, parsedFiles, outDir, prettyPrint, outputFormat, generateElementary, generateCxfCore, mode, parsedClasses, parsedJsons)
        if (simJson !== null) {
          (
            jsons.push(...simJson)
          )
        }
      }
    })

    try {
      generateObjectsAndCxf(parsedClasses, tempJsonDir, prettyPrint, outputFormat, generateElementary, generateCxfCore, mode, valueProp, evaluateExpressions, flattenArrays)

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
  if (outputFormat === 'raw-json') {
    delete rawJson.fullMoFilePath
  }
  return rawJson
}

/**
 * Heuristic used in 'modelica' mode to decide whether an instantiated class
 * should be skipped during recursive parsing.
 *
 * CXF export in 'modelica' mode only needs the model under test and the CDL
 * control blocks it instantiates (directly or via an extends clause). Skipping
 * non-control library classes avoids parsing deep, irrelevant dependency trees
 * (e.g. Buildings.Fluid for a fan). A class is skipped when it belongs to the
 * Buildings library or the Modelica Standard Library but not to a Templates,
 * Examples or Controls package. User-defined classes are never skipped.
 *
 * @param {string} filePath - path of an instantiated class's Modelica file.
 * @returns {boolean} - true if the class should NOT be recursively parsed.
 */
function skipInstantiationInModelicaMode (filePath) {
  const tokens = filePath.split(path.sep)
  const inLibrary = tokens.includes('Buildings') || tokens.includes('Modelica')
  if (!inLibrary) {
    return false
  }
  const isControlRelated = tokens.includes('Templates') || tokens.includes('Examples') || tokens.includes('Controls')
  return !isControlRelated
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
 * @param {string} mode - Indicates whether to parse a 'cdl' (default) or 'modelica' file with outputFormat='cxf'.
 * @param {Map<string, Object>} [parsedClasses] - an accumulator of json which is carried through
 * by the classes that it encounters during parsing. It contains the class' own JSON,
 * the JSONs of the classes it instantiates, and the list of those classes.
 * All of this context is used specifically to track evaluation dependencies and the relationships between classes during parsing.
 * @param {Map<string, Array<Object>>} [parsedJsons] - the dependency closure of every
 * file read so far, keyed by resolved path. A file is still read only once, but a
 * later file that depends on it is handed the JSON from here rather than being left
 * without it, which is what keeps the returned array the same whichever file of the
 * run reached the dependency first.
 * @returns {Array<Object>} - An array of JSON objects representing the Modelica file and all used classes.
 */
function getSimpleJson (moFile, tempDir, parsedFiles, outDir, prettyPrint, outputFormat, generateElementary, generateCxfCore, mode, parsedClasses = new Map(), parsedJsons = new Map()) {
  // check if it is in the cdl model, output simplified json, and the file is a cdl elementary block.
  const isElementaryBlockCDL = ut.checkIfCdlElementaryBlockOrPackage(moFile, true)
  // check if the modelica file is within OBC package.
  const OBCPath = ['Buildings', 'Controls', 'OBC'].join(path.sep)
  if ((isElementaryBlockCDL || !moFile.includes(OBCPath) || moFile.includes('UsersGuide')) && outputFormat === 'json' && mode === 'cdl') {
    return null
  }

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
    // if the moFile is a package.mo file, retrieve content in the package.order file
    const packageOrder = ut.getPackageOrder(moFile)
    // get the raw-json output: this process will add relative and full modelica file path to the json output
    const rawJson = getRawJson(moFile, 'json')
    Object.assign(rawJson, { checksum: moChecksum })
    const curSimJson = jq.simplifyModelicaJSON(rawJson)
    // Check if the 'defaultComponentName' or 'Documentation' is missing.
    if (outputFormat === 'json' && mode === 'cdl') {
      checkCDLSequence(curSimJson, moFile)
    }
    jsons.push(curSimJson)
    // write names of the class in the package, if it is a package.mo file
    if (packageOrder !== undefined) {
      jsons[0].order = packageOrder
    }
    // write the simplified json output to file
    const out = prettyPrint ? JSON.stringify(jsons[0], null, 2) : JSON.stringify(jsons[0])
    ut.writeFile(outputFileName, out)
    // store the path of the parsed file
    parsedFiles.push(jsons[0].fullMoFilePath)
  }

  // recursively process all instantiated files
  const instantiatedClasses = getInstantiatedFile(jsons[0], moFile)
  // In 'modelica' mode, CXF is exported only for CDL control blocks (found via
  // the __cdl(isControls=true) annotation) and the model instantiating them, so
  // the dependency tree of non-control library components (e.g. a fan from
  // Buildings.Fluid) does not need to be parsed. Skip recursing into Buildings
  // or Modelica Standard Library classes unless they belong to a Templates,
  // Examples or Controls package (which may contain control sequences).
  const neededClasses = mode === 'modelica'
    ? instantiatedClasses.filter(function (val) {
      return !skipInstantiationInModelicaMode(val)
    })
    : instantiatedClasses

  const newInstantiatedClasses = neededClasses.filter(function (val) {
    return parsedFiles.indexOf(val) === -1
  })
  const readInstantiatedClasses = neededClasses.filter(function (val) {
    return parsedFiles.indexOf(val) !== -1
  })
  if (newInstantiatedClasses !== undefined && newInstantiatedClasses !== null && newInstantiatedClasses.length > 0) {
    newInstantiatedClasses.forEach((element) => {
      const simJson = getSimpleJson(element, tempDir, parsedFiles, outDir, prettyPrint, outputFormat, generateElementary, generateCxfCore, mode, parsedClasses, parsedJsons)
      if (simJson !== null) {
        jsons.push(...simJson)
      }
    })
  }

  // add previously read instantiated classes from the cache to the current JSON scope
  const seen = new Set(jsons.map(json => json.fullMoFilePath))
  readInstantiatedClasses.forEach((element) => {
    const cached = parsedJsons.get(path.resolve(element))

    if (cached == null) return
    cached.forEach((json) => {
      if (seen.has(json.fullMoFilePath)) return
      seen.add(json.fullMoFilePath)
      jsons.push(json)
    })
  })

  /* neither the values of this class' expressions nor whether it is a sequence of
     its own is settled until every file of this call has been read. Keyed by
     resolved path, so a class reached through several instantiations is recorded
     once
   */
  if ((outputFormat === 'semantic' || outputFormat === 'cxf') &&
    !parsedClasses.has(path.resolve(moFile))) { // if the class has not been parsed yet
    parsedClasses.set(path.resolve(moFile), {
      moFile,
      jsonOutput: jsons[0],
      jsons,
      instantiatedClasses
    })
  }

  // return array of JSON objects without duplicates
  const uniqueJsons = ut.getUniqueObjectsFromArray(jsons) // remove duplicates
  parsedJsons.set(path.resolve(moFile), uniqueJsons)
  return uniqueJsons
}

/**
 * extracts the instances and connections of a class and writes them to file
 *
 * @param {Object} jsonOutput - The JSON representation of the class.
 * @param {string} moFile - The path of the Modelica file.
 * @param {string} tempDir - The directory to write the objects JSON to.
 * @param {boolean} prettyPrint - Whether the JSON output should be pretty-printed.
 * @param {string} mode - Either 'cdl' (default) or 'modelica'.
 * @param {Array<Object>} [jsons] - The JSON representations of the class and of
 *     every class it instantiates. They are needed to evaluate the expressions
 *     the class declares: without them the expressions are left as they are.
 * @param {Object} [userValues] - Values supplied for the parameters of the class,
 *     which take precedence over the bindings declared in the Modelica source.
 * @param {boolean} [isSequence=false] - Whether the file holds a sequence of its
 *     own, as opposed to a class another file of the same call instantiates. Only
 *     a sequence of its own resolves the parameters no binding gives a value to,
 *     and only it has its sub-sequences extracted: a class that is instantiated
 *     elsewhere takes the values of its parameters at the point of instantiation.
 * @param {boolean} [evaluateExpressions=false] - Whether the expressions a class
 *     declares are resolved to literal values. With it off nothing is evaluated
 *     and no sub-sequence is extracted: a sub-sequence exists to hold the values
 *     one instantiation resolved to, and with none resolved it would be a copy
 *     of the class file. The objects json is then what the Modelica declared.
 * @param {boolean} [flattenArrays=false] - Whether an array is expanded into one
 *     component per element, `blk[3]` into `blk_1`, `blk_2`, `blk_3`, with the
 *     connections rewritten to match. A platform that supports arrays of its
 *     own wants them left as they are, so this is off for that target and the
 *     objects json keeps the arrays the Modelica source declared. An array is
 *     only expandable once its dimensions and the values its elements are bound
 *     to are known, so this flag evaluates the expressions it needs whether or
 *     not `evaluateExpressions` is set; with that one clear, every expression
 *     the expansion did not consume is put back as the source wrote it, so the
 *     objects json holds flattened components with symbolic bindings.
 * @returns {{allObjectsJson: Object, subSequences: Object}} - The extracted
 *     instances and connections, and the same for every sub-sequence.
 */
function generateAllObjectsJson (jsonOutput, moFile, tempDir, prettyPrint, mode, jsons, userValues = null, isSequence = false, evaluateExpressions = false, flattenArrays = false) {
  // instances and connections extraction
  const allObjectsJson = oe.extractAllObjects(jsonOutput, null, mode, jsons, userValues, isSequence,
    evaluateExpressions, flattenArrays)
  const allObjectsJsonPath = ut.getOutputFile(moFile, 'objects', tempDir)
  // only extract sub-sequences if it's a sequence and expressions are being evaluated
  // only if evaluating expressions because extracting sub-sequences rewrites the component that instantiates them
  const subSequences = isSequence && evaluateExpressions
    ? oe.extractAllSubSequences(allObjectsJson, jsonOutput, jsons, userValues, isSequence, flattenArrays)
    : {}

  // writes each sub-sequence to its own JSON file
  // formatted as {className}.{instantationName}.json
  Object.entries(subSequences).forEach(([name, objects]) => {
    writeJson(objects, path.join(path.dirname(allObjectsJsonPath), name + '.json'), prettyPrint)
  })

  // writes the main objects JSON file
  writeJson(allObjectsJson, allObjectsJsonPath, prettyPrint)
  return { allObjectsJson, subSequences }
}

/**
 * writes a JSON object to a file
 *
 * @param {Object} content - the object to write
 * @param {string} filePath - the path of the file to write it to
 * @param {boolean} prettyPrint - whether the JSON output should be pretty-printed
 * @returns {void}
 */
function writeJson (content, filePath, prettyPrint) {
  ut.writeFile(filePath, prettyPrint ? JSON.stringify(content, null, 2) : JSON.stringify(content))
}

/**
 * the values a user supplied for the parameters of
 * one Modelica file, found in params.json by default
 *
 * @param {string} [valueProp] - the path the values were supplied at
 * @param {string} moFile - the path of the Modelica file
 * @returns {Object|null} - the values, or null when none were supplied for it
 */
function readUserValues (valueProp, moFile) {
  if (valueProp == null || valueProp === '' || !fs.existsSync(valueProp)) {
    return null
  }

  const className = path.basename(moFile, '.mo')

  // if the valueProp is a directory, look for a JSON file named after the class inside it.
  if (fs.statSync(valueProp).isDirectory()) {
    const valueFile = path.join(valueProp, className + '.json')
    return fs.existsSync(valueFile) ? JSON.parse(fs.readFileSync(valueFile, 'utf8')) : null
  }

  // if the valueProp is a file, read its content directly.
  const content = JSON.parse(fs.readFileSync(valueProp, 'utf8'))

  const perSequence = content[className]
  if (perSequence != null && typeof perSequence === 'object' && !Array.isArray(perSequence)) {
    return perSequence
  }

  return Object.values(content).every(value => value == null || typeof value !== 'object')
    ? content
    : null
}

/**
 *
 * This runs once every file has been read rather than file by file inside
 * getSimpleJson, because neither of the two things it decides is known earlier
 * (see the note at the top of this file):
 *   - whether a class is a sequence of its own. A class another class of the same
 *     call instantiates is not one, and the class that instantiates it may only
 *     be read after it. Being a sequence is what decides whether the values a
 *     user supplied apply, whether the parameters with no binding fall back on
 *     defaults, and whether the sub-sequences it contains are expanded.
 *   - the values of the expressions a class declares. They are evaluated against
 *     the JSONs of the classes it instantiates, which is the jsons array
 *     parsedClasses carries for it.
 *
 * @param {Map<string, Object>} parsedClasses - What getSimpleJson collected.
 * @param {string} tempDir - The directory to write the output to.
 * @param {boolean} prettyPrint - Whether the JSON output should be pretty-printed.
 * @param {string} outputFormat - The output format.
 * @param {boolean} generateElementary - Whether to generate elementary JSON files.
 * @param {boolean} generateCxfCore - Whether to generate CXF core files.
 * @param {string} mode - Either 'cdl' (default) or 'modelica'.
 * @param {string} [valueProp] - Path of the user supplied parameter values.
 * @param {boolean} [evaluateExpressions=false] - Whether expressions are resolved.
 *     See `generateAllObjectsJson`.
 * @param {boolean} [flattenArrays=false] - Whether arrays are flattened. See
 *     `generateAllObjectsJson`.
 * @returns {void}
 */
function generateObjectsAndCxf (parsedClasses, tempDir, prettyPrint, outputFormat, generateElementary, generateCxfCore, mode, valueProp, evaluateExpressions = false, flattenArrays = false) {
  // The union of every class instantiated by any class of this call. A class in
  // it is a sub-sequence of another file, so its parameters take the values they
  // are given at the point of instantiation, not user supplied values or
  // defaults; it is expanded, and written to CXF, from the sequence above it.
  const instantiated = new Set()

  parsedClasses.forEach(({ instantiatedClasses }) => {
    (instantiatedClasses ?? []).forEach(file => instantiated.add(path.resolve(file)))
  })

  parsedClasses.forEach(({ moFile, jsonOutput, jsons }, resolvedPath) => {
    // A sequence is a root of the tree this call read: no other class parsed
    // here instantiates it.
    const isSequence = !instantiated.has(resolvedPath)

    // generate the JSON for all objects in this class, including any sub-sequences
    // but if its a root sequence, we also read user-supplied values for it
    const { allObjectsJson, subSequences } = generateAllObjectsJson(
      jsonOutput, moFile, tempDir, prettyPrint, mode, jsons,
      isSequence ? readUserValues(valueProp, moFile) : null, isSequence, evaluateExpressions, flattenArrays)

    if (outputFormat === 'cxf' && mode === 'cdl') {
      generateCxf(allObjectsJson, moFile, tempDir, prettyPrint, generateElementary,
        generateCxfCore, mode, subSequences)
    }
  })
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
 * writes the CXF of a class.
 *
 * @param {Object} jsonOutput - The instances and connections of the class.
 * @param {string} moFile - The path of the Modelica file the class was read from.
 * @param {string} tempDir - The directory to write the CXF to.
 * @param {boolean} prettyPrint - Whether the JSON output should be pretty-printed.
 * @param {boolean} generateElementary - Whether to generate elementary CXF files.
 * @param {boolean} generateCxfCore - Whether to generate CXF core files.
 * @param {string} mode - Either 'cdl' (default) or 'modelica'.
 * @param {Object} [subSequences] - The sub-sequences the class resolved, keyed
 *     by the name each takes. They are written into the same CXF file as the
 *     sequence, so that it carries the definition of every block it contains
 *     and needs no companion file to resolve them.
 * @returns {string|undefined} - The path the CXF was written to.
 */
function generateCxf (jsonOutput, moFile, tempDir, prettyPrint, generateElementary, generateCxfCore, mode, subSequences = {}) {
  /* A sub-sequence is a block of its own, but it is not a file of its own: it
     goes into the graph of the sequence that instantiates it, so that the CXF
     of a sequence resolves on its own. */
  const subBlocks = Object.entries(subSequences).map(([name, objects]) => ({
    blockName: name,
    instances: objects.instances,
    requiredReferences: objects.requiredReferences
  }))
  const fileNameTokens = moFile.split('.mo')[0].split(path.sep)
  let outputFilePath

  // CXF is only generated for CDL-compliant files. Modelica Standard Library
  // classes are pulled in only to resolve types; they are not valid CDL and
  // cannot be serialized to CXF, so skip them.
  if (isModelicaStandardLibraryFile(moFile)) {
    return outputFilePath
  }
  const isElementaryBlock = ut.checkIfCdlElementaryBlockOrPackage(moFile, true)

  if (fileNameTokens.includes('CDL')) {
    let cxfGraphJsonLd
    if ((isElementaryBlock && (generateCxfCore || generateElementary)) || (!isElementaryBlock)) {
      const instances = jsonOutput.instances
      const requiredReferences = jsonOutput.requiredReferences
      const blockName = moFile.split(path.sep)[moFile.split(path.sep).length - 1].split('.mo')[0]
      cxfGraphJsonLd = Object.assign({}, cxfGraphJsonLd, cxfExt.getCxfGraph(instances, requiredReferences, blockName, generateElementary, generateCxfCore, subBlocks))
    }
    if (cxfGraphJsonLd !== undefined && cxfGraphJsonLd !== null) {
      const cxfCoreGraphJsonLdOut = prettyPrint ? JSON.stringify(cxfGraphJsonLd, null, 2) : JSON.stringify(cxfGraphJsonLd)
      const cxfCorePath = cxfOutputFile(moFile, tempDir)
      ut.writeFile(cxfCorePath, cxfCoreGraphJsonLdOut)
    }
  } else {
    const instances = jsonOutput.instances
    const requiredReferences = jsonOutput.requiredReferences
    const blockName = moFile.split(path.sep)[moFile.split(path.sep).length - 1].split('.mo')[0]
    const cxfGraphJsonLd = cxfExt.getCxfGraph(instances, requiredReferences, blockName, generateElementary, generateCxfCore, subBlocks)
    if (cxfGraphJsonLd !== undefined && cxfGraphJsonLd !== null && Object.keys(cxfGraphJsonLd).length > 0) {
      const cxfGraphJsonLdOut = prettyPrint ? JSON.stringify(cxfGraphJsonLd, null, 2) : JSON.stringify(cxfGraphJsonLd)
      const cxfPath = cxfOutputFile(moFile, tempDir)
      ut.writeFile(cxfPath, cxfGraphJsonLdOut)
      return cxfPath
    } else {
      // TODO: only extract CDL instances
      // console.log(`${moFile} not a valid CDL file. Not generating CXF`)
    }
  }
}

/**
 * the file the CXF of a class is written to
 *
 * @param {string} moFile - The path of the Modelica file.
 * @param {string} tempDir - The directory to write the CXF to.
 * @returns {string} - The path of the CXF file.
 */
function cxfOutputFile (moFile, tempDir) {
  return ut.getOutputFile(moFile, 'cxf', tempDir)
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
  const moOutput = storedDefinition.parse(jsonOutput, rawJson)

  // find the output file path
  const outputFileName = ut.getOutputFile(jsonFile, 'modelica', outDir)
  ut.writeFile(outputFileName, moOutput)
  return moOutput
}

/**
 * Check in the CDL sequence if there is missing defaultComponentName or Documentation.
 * @param {object} jsonOutput Simplified json output
 * @param {String} moFile The path to the Modelica file
 */
function checkCDLSequence (jsonOutput, moFile) {
  const pathArray = moFile.split(path.sep)
  if (pathArray.includes('package.mo') || pathArray.includes('Modelica')) {
    return
  }
  const longClassAnnotation = jq.getProperty(['stored_class_definitions', 0, 'class_specifier', 'long_class_specifier', 'composition', 'annotation'], jsonOutput)
  if (longClassAnnotation !== null) {
    const eleModNam = []
    longClassAnnotation.forEach((element) => {
      const eleNam = jq.getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], element)
      if (eleNam !== null) {
        eleModNam.push(eleNam)
      }
    })
    const missDefNam = !eleModNam.includes('defaultComponentName')
    if (missDefNam && !(pathArray.includes('Validation') || pathArray.includes('Examples'))) {
      console.warn(moFile, 'does not have "defaultComponentName".')
      warnCounter = warnCounter + 1
    }
    const missDoc = !eleModNam.includes('Documentation')
    if (missDoc) {
      console.warn(moFile, 'does not have "Documentation" section.')
      warnCounter = warnCounter + 1
    }
  }
}

module.exports.getJsons = getJsons
module.exports.convertToModelica = convertToModelica
Object.defineProperty(module.exports, 'warnCounter', { get: () => warnCounter })
