'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const pa = require('../lib/parser')
const ut = require('../lib/util')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const glob = require('glob-promise')
const logger = require('winston')
const se = require('../lib/semanticExtractor.js')
const ce = require('../lib/cxfExtractor.js')
const rdflib = require('rdflib')

logger.configure({
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'tests.log' })
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true
})
logger.cli()

logger.level = 'error'

/** Function to get all the Modelica files to be tested
  */
const getIntFiles = function (mode = 'cdl') {
  let pattern
  if (mode === 'cdl') {
    pattern = path.join(__dirname, 'FromModelica', '*.mo')
    const filesToExclude = [
      path.join(__dirname, 'FromModelica', 'ExtendsClause_2.mo'),
      path.join(__dirname, 'FromModelica', 'ExtendsClause_3.mo')
    ]
    const allFiles = glob.sync(pattern)
    return allFiles.filter(f => !filesToExclude.includes(f))
  } else if (mode === 'modelica') {
    // CDL control blocks instantiated within (non-CDL) Modelica models. These
    // live in the ModelicaMode package and are parsed in 'modelica' mode so the
    // generic recursion does not descend into heavy non-CDL dependency trees.
    return [
      path.join(__dirname, 'ModelicaMode', 'ModelWithControlsBlock.mo'),
      path.join(__dirname, 'ModelicaMode', 'ModelWithControlsBlock2.mo')
    ]
  }
}

/**
 * Parse a JSON-LD string into a sorted array of canonical triple strings.
 *
 * rdflib fully expands every IRI using the document's own @context, so the
 * result is independent of which prefixes were used in the serialization
 * (e.g. `S231:Block` and `http://data.ashrae.org/S231#Block`, or an
 * abbreviated `exa:Foo` vs a full `http://example.org#Foo`, all collapse to
 * the same triples). CXF documents contain no blank nodes (every node has an
 * explicit @id), so two graphs are equal iff their triple sets are equal.
 *
 * rdflib's JSON-LD parsing is asynchronous (the statements are only available
 * once the callback fires), so this returns a Promise.
 *
 * @param {string} jsonldString - The raw JSON-LD document content.
 * @returns {Promise<string[]>} Sorted canonical triples.
 */
function cxfTriples (jsonldString) {
  return new Promise((resolve, reject) => {
    const graph = rdflib.graph()
    rdflib.parse(jsonldString, graph, 'http://example.org/cxf-comparison', 'application/ld+json', (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(graph.statements.map(st => {
        const o = st.object
        const datatype = (o.termType === 'Literal' && o.datatype) ? o.datatype.value : ''
        const language = (o.termType === 'Literal' && o.language) ? o.language : ''
        return [st.subject.value, st.predicate.value, o.termType, o.value, datatype, language].join(' | ')
      }).sort())
    })
  })
}

/**
 * Assert that two CXF JSON-LD documents describe the same RDF graph, ignoring
 * prefix/serialization differences. On failure it reports the diverging
 * triples instead of an opaque string mismatch.
 *
 * @param {string} actualString - Generated JSON-LD content.
 * @param {string} expectedString - Reference JSON-LD content.
 * @param {string} message - Assertion message prefix.
 */
async function assertCxfGraphsEqual (actualString, expectedString, message) {
  const actual = await cxfTriples(actualString)
  const expected = await cxfTriples(expectedString)
  // A valid CXF document always yields at least one triple (the block's type).
  // Guard against a silent parse failure making two empty graphs trivially equal.
  as.ok(expected.length > 0, message + '\n  reference graph parsed to 0 triples (parse failure?)')
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  const onlyInActual = actual.filter(t => !expectedSet.has(t))
  const onlyInExpected = expected.filter(t => !actualSet.has(t))
  as.deepEqual(
    { onlyInActual, onlyInExpected },
    { onlyInActual: [], onlyInExpected: [] },
    message +
      '\n  ' + onlyInActual.length + ' triple(s) only in actual, ' + onlyInExpected.length + ' only in expected.' +
      (onlyInActual.length ? '\n  e.g. only in actual:   ' + onlyInActual[0] : '') +
      (onlyInExpected.length ? '\n  e.g. only in expected: ' + onlyInExpected[0] : '')
  )
}

/** Function that checks parsing from Modelica to JSON, in 'cdl' parsing mode
  */
const checkCdlJSON = function (outFormat, extension, message) {
  const mode = 'cdl'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files array to be tested.
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = testMoFilesTemp.filter(function (obj) {
      return !obj.includes('Extends')
    })
    // Name of subpackage to store json output files
    const subPackName = (outFormat === 'raw-json' ? 'raw-json' : 'json')
    // When parsing mode is 'cdl', the moFiles should feed into parser one-by-one
    const testOutputDir = path.join(process.cwd(), subPackName)
    // If the test output folder exists, it should be deleted so each test will generate new outputs.
    if (fs.existsSync(testOutputDir)) {
      ut.removeDir(testOutputDir)
    }
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference')

    testMoFiles.forEach(fil => {
      // 'fil.split()' changes string 'fil' to be string array with single element
      // 'fil' is like '../test/FromModelica/***.mo'
      // const jsonNewCDL = pa.getJSON(fil.split(), mode, outFormat)
      pa.getJsons([fil], outFormat, 'current', 'false')
      const idx = fil.lastIndexOf(path.sep)
      const jsonNewCDLFile = path.join(testOutputDir, 'test', 'FromModelica', fil.slice(idx + 1, -3) + extension)

      // Read the stored json representation from disk
      // It's like '../test/FromModelica/cdl/json/***.json'
      const oldFilCDL = path.join(expectedOutputPath, subPackName, 'test', 'FromModelica', fil.slice(idx + 1, -3) + extension)

      // Read the old json
      const neCDL = JSON.parse(fs.readFileSync(jsonNewCDLFile, 'utf8'))
      const oldCDL = JSON.parse(fs.readFileSync(oldFilCDL, 'utf8'))

      // Update the path to be relative to the project home.
      // This is needed for the regression tests to be portable.
      if (oldCDL.modelicaFile) {
        oldCDL.fullMoFilePath = oldCDL.modelicaFile.split('modelica-json/')[1]
      }
      if (neCDL.modelicaFile) {
        neCDL.fullMoFilePath = neCDL.modelicaFile.split('modelica-json/')[1]
      }
      const tempOld = JSON.stringify(oldCDL)
      const tempNew = JSON.stringify(neCDL)

      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFilCDL)
    })
    ut.removeDir(testOutputDir)
  })
}

/** Function that checks parsing from Modelica to JSON, in 'modelica' parsing mode
  */
const checkModJSON = function (outFormat, extension, message) {
  const mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files package to be tested
    // const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = getIntFiles(mode)

    // Name of subpackage to store json output files
    const subPackName = (outFormat === 'raw-json' ? 'raw-json' : 'json')
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    const testOutputDir = path.join(process.cwd(), subPackName)
    // If the test output folder exists, it should be deleted so each test will generate new outputs.
    if (fs.existsSync(testOutputDir)) {
      ut.removeDir(testOutputDir)
    }
    // const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
    pa.getJsons(testMoFiles, outFormat, 'current', 'false', false, false, mode)
    // const pattern = path.join('test', 'ModelicaMode', 'ModelWithControlsBlock*.mo')
    const files = getIntFiles(mode)
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference')

    for (let i = 0; i < files.length; i++) {
      const idx2 = files[i].lastIndexOf(path.sep)
      const fileNameMOD = files[i].slice(idx2 + 1, -3) + extension
      const oldFileMOD = path.join(expectedOutputPath, subPackName, 'test', 'ModelicaMode', fileNameMOD)
      // Read the old json
      const jsonOldMOD = JSON.parse(fs.readFileSync(oldFileMOD, 'utf8'))

      if (jsonOldMOD.modelicaFile) {
        jsonOldMOD.fullMoFilePath = jsonOldMOD.modelicaFile.split('modelica-json/')[1]
      }
      const jsonNewMOD = path.join(process.cwd(), subPackName, 'test', 'ModelicaMode', fileNameMOD)
      const neMOD = JSON.parse(fs.readFileSync(jsonNewMOD, 'utf8'))
      if (neMOD.modelicaFile) {
        neMOD.fullMoFilePath = neMOD.modelicaFile.split('modelica-json/')[1]
      }

      const tempOld = JSON.stringify(jsonOldMOD)
      const tempNew = JSON.stringify(neMOD)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFileMOD)
    }
    ut.removeDir(testOutputDir)
  })
}

/** Function that checks parsing from Modelica to Objects Json, in 'modelica' parsing mode
  */
const checkObjectsJSON = function (outFormat, extension, message) {
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files package to be tested
    // const testMoFilesTemp = getIntFiles(mode)
    // const testMoFiles = ut.getMoFiles(testMoFilesTemp)
    const testMoFiles = ut.getMoFiles(path.join(__dirname, 'FromModelica'))

    // Name of subpackage to store json output files
    const subPackName = 'objects'
    const testOutputDir = path.join(process.cwd(), subPackName)
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    // const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
    if (fs.existsSync(testOutputDir)) {
      ut.removeDir(testOutputDir)
    }
    pa.getJsons(testMoFiles, outFormat, 'current', 'false')
    const pattern = path.join('test', 'FromModelica', '*.mo')
    const files = glob.sync(pattern)
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference', subPackName, 'test', 'FromModelica')
    const actualOutputPath = path.join(testOutputDir, 'test', 'FromModelica')

    for (let i = 0; i < files.length; i++) {
      if (outFormat === 'semantic') {
        se.getSemanticInformation(files[i], process.cwd())
      }

      const idx2 = files[i].lastIndexOf(path.sep)
      const fileNameMOD = files[i].slice(idx2 + 1, -3) + extension
      const oldFileMOD = path.join(expectedOutputPath, fileNameMOD)
      // Read the old json
      const jsonOldMOD = JSON.parse(fs.readFileSync(oldFileMOD, 'utf8'))
      const oldInstances = jsonOldMOD.instances
      for (const oldInstanceId in oldInstances) {
        if ('fullMoFilePath' in oldInstances[oldInstanceId] && oldInstances[oldInstanceId].fullMoFilePath !== undefined) {
          oldInstances[oldInstanceId].fullMoFilePath = 'samMoFile'
        }
      }
      jsonOldMOD.instances = oldInstances

      const jsonNewMOD = path.join(actualOutputPath, fileNameMOD)
      const neMOD = JSON.parse(fs.readFileSync(jsonNewMOD, 'utf8'))
      const newInstances = neMOD.instances
      for (const newInstanceId in newInstances) {
        if ('fullMoFilePath' in newInstances[newInstanceId] && newInstances[newInstanceId].fullMoFilePath !== undefined) {
          newInstances[newInstanceId].fullMoFilePath = 'samMoFile'
        }
      }
      neMOD.instances = newInstances

      const tempOld = JSON.stringify(jsonOldMOD)
      const tempNew = JSON.stringify(neMOD)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFileMOD)
    }

    // This has been hardcoded
    const expectedSemanticOutputPath = path.join(process.cwd(), 'test', 'reference', subPackName)
    const expectedBrickPath = path.join(expectedSemanticOutputPath, 'Brick', '1.3', 'test', 'FromModelica')
    const expectedEnPath = path.join(expectedSemanticOutputPath, 'en', 'test', 'FromModelica')

    const actualSemanticOutputPath = path.join(process.cwd(), subPackName)
    const actualBrickPath = path.join(actualSemanticOutputPath, 'Brick', '1.3', 'test', 'FromModelica')
    const actualEnPath = path.join(actualSemanticOutputPath, 'en', 'test', 'FromModelica')

    const semanticFiles = {}
    // semanticFiles[path.join(expectedBrickPath, 'MyControllerWithSemantics.ttl')] = path.join(actualBrickPath, 'MyControllerWithSemantics.ttl')
    semanticFiles[path.join(expectedBrickPath, 'SubControllerWithSemantics.ttl')] = path.join(actualBrickPath, 'SubControllerWithSemantics.ttl')
    semanticFiles[path.join(expectedEnPath, 'MyControllerWithSemantics.txt')] = path.join(actualEnPath, 'MyControllerWithSemantics.txt')

    for (const expectedFileName in semanticFiles) {
      const actualFileName = semanticFiles[expectedFileName]
      const expectedFile = fs.readFileSync(expectedFileName, 'utf8')
      const actualFile = fs.readFileSync(actualFileName, 'utf8')
      as.deepEqual(actualFile, expectedFile, 'Semantic File result differs for ' + actualFileName)
    }
    ut.removeDir(testOutputDir)
    ut.removeDir(actualSemanticOutputPath)
    // delete new json output files
    const jsonOutputDir = path.join(process.cwd(), 'json')
    if (fs.existsSync(jsonOutputDir)) {
      ut.removeDir(jsonOutputDir)
    }
  })
}

/** Function that checks parsing from Modelica to Objects Json, in 'modelica' parsing mode
  */
const checkCxfJson = function (outFormat, extension, message) {
  const mode = 'cdl'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, async () => {
    // mo files package to be tested
    // const testMoFilesTemp = getIntFiles(mode)
    // const testMoFiles = ut.getMoFiles(testMoFilesTemp)
    const testMoFiles = getIntFiles(mode)

    // Name of subpackage to store json output files
    const subPackName = 'cxf'
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    // const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
    const testOutputDir = path.join(process.cwd(), subPackName)
    if (fs.existsSync(testOutputDir)) {
      ut.removeDir(testOutputDir)
    }
    pa.getJsons(testMoFiles, outFormat, 'current', 'false')
    const files = getIntFiles(mode)
    const filesToExclude = [
      path.join('test', 'FromModelica', 'ExtendsClause_2.mo'),
      path.join('test', 'FromModelica', 'ExtendsClause_3.mo')
    ]
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference', subPackName, 'test', 'FromModelica')
    const actualOutputPath = path.join(process.cwd(), subPackName, 'test', 'FromModelica')

    for (let i = 0; i < files.length; i++) {
      const idx2 = files[i].lastIndexOf(path.sep)
      const fileNameMOD = files[i].slice(idx2 + 1, -3) + extension
      if (!filesToExclude.includes(files[i])) {
        const oldFileMOD = path.join(expectedOutputPath, fileNameMOD)
        const jsonNewMOD = path.join(actualOutputPath, fileNameMOD)
        // Compare the generated and reference CXF as RDF graphs so that
        // differences in how IRIs are abbreviated (prefixes / @context) are
        // ignored and only the actual triples are compared.
        const expectedString = fs.readFileSync(oldFileMOD, 'utf8')
        const actualString = fs.readFileSync(jsonNewMOD, 'utf8')
        as.notEqual(expectedString, undefined, 'JSON is undefined')
        await assertCxfGraphsEqual(actualString, expectedString, 'CXF graph differs for ' + oldFileMOD)
      } else {
        const jsonLdPath = path.join(actualOutputPath, fileNameMOD)
        as.throws(function () { fs.readFileSync(jsonLdPath, 'utf8') }, Error, 'Error should be thrown for CXF generation of' + jsonLdPath)
      }
    }
    ut.removeDir(testOutputDir)
    // delete new json output files
    const jsonOutputDir = path.join(process.cwd(), 'json')
    if (fs.existsSync(jsonOutputDir)) {
      ut.removeDir(jsonOutputDir)
    }
    // delete new objects output files
    const objectsOutputDir = path.join(process.cwd(), 'objects')
    if (fs.existsSync(objectsOutputDir)) {
      ut.removeDir(objectsOutputDir)
    }
  })
}

async function checkCxfCoreGeneration () {
  const cdlPath = path.join('Buildings', 'Controls', 'OBC', 'CDL')
  const testMoFiles = ut.getMoFiles(cdlPath)

  const cxfTestOutputDir = path.join(process.cwd(), 'cxf')
  // If the test output folder exists, it should be deleted so each test will generate new outputs.
  if (fs.existsSync(cxfTestOutputDir)) {
    ut.removeDir(cxfTestOutputDir)
  }
  pa.getJsons(testMoFiles, 'cxf', 'current', true, true, true)
  ce.getCxfCore(path.join(process.cwd(), cdlPath), 'current', true)

  const actualOutputCxfCorePath = path.join(process.cwd(), 'cxf', 'CXF-Core.jsonld')
  const actualOutputCxfCore = fs.readFileSync(actualOutputCxfCorePath, 'utf8')

  const refOutputCxfCorePath = path.join(process.cwd(), 'test', 'reference', 'cxf', 'CXF-Core.jsonld')
  const refOutputCxfCore = fs.readFileSync(refOutputCxfCorePath, 'utf8')

  // Compare as RDF graphs so prefix/serialization differences are ignored.
  await assertCxfGraphsEqual(actualOutputCxfCore, refOutputCxfCore, 'CXF-Core.jsonld different for generated file=' + actualOutputCxfCorePath + ' and reference file=' + refOutputCxfCorePath)
  ut.removeDir(cxfTestOutputDir)
  // delete new json output files
  const jsonOutputDir = path.join(process.cwd(), 'json')
  if (fs.existsSync(jsonOutputDir)) {
    ut.removeDir(jsonOutputDir)
  }
  // delete new objects output files
  const objectsOutputDir = path.join(process.cwd(), 'objects')
  if (fs.existsSync(objectsOutputDir)) {
    ut.removeDir(objectsOutputDir)
  }
}

/** Function that checks CXF export from a Modelica file in 'modelica' parsing
  * mode (i.e. a CDL control block instantiated within a non-CDL Modelica model
  * and marked with __cdl(isControls=true)). The export produces CXF for the
  * enclosing model and for the control block class. The control block may be a
  * direct component instance or one redeclared in an extends clause (template).
  *
  * @param message test description
  * @param moFilePath path to the top-level Modelica file
  * @param outputFiles list of generated CXF files (relative to the cxf output
  *   directory) to compare against the committed references
  */
function checkCxfFromModelica (message, moFilePath, outputFiles) {
  mo.it(message, () => {
    const moFiles = ut.getMoFiles(moFilePath)
    pa.getJsons(moFiles, 'cxf', 'current', true, false, false, 'modelica')
    ce.getCxfFromModelica(moFiles[0], 'current', true)

    for (let i = 0; i < outputFiles.length; i++) {
      const actualPath = path.join(process.cwd(), 'cxf', outputFiles[i])
      const refPath = path.join(process.cwd(), 'test', 'reference', 'cxf', outputFiles[i])
      const actual = JSON.stringify(JSON.parse(fs.readFileSync(actualPath, 'utf8')))
      const ref = JSON.stringify(JSON.parse(fs.readFileSync(refPath, 'utf8')))
      as.notEqual(ref, undefined, 'Reference CXF is undefined')
      as.deepEqual(actual, ref, 'CXF result differs for ' + refPath)
    }
  })
}

mo.describe('parser.js', function () {
  mo.describe('Testing Modelica to raw-json using CDL files', function () {
    checkCdlJSON('raw-json', '.json', 'Testing unmodified json for equality, "cdl" mode')
  })
  mo.describe('Testing Modelica to raw-json using modelica files', function () {
    checkModJSON('raw-json', '.json', 'Testing unmodified json for equality, "modelica" mode')
  })
  mo.describe('Testing Modelica to JSON using CDL files', function () {
    checkCdlJSON('json', '.json', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing Modelica to JSON using modelica files', function () {
    checkModJSON('json', '.json', 'Testing json for equality, "modelica" mode')
  })
  mo.describe('Testing parse from Modelica to Objects Json', function () {
    checkObjectsJSON('semantic', '.json', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing parse from Modelica to CXF JsonLD', function () {
    checkCxfJson('cxf', '.jsonld', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing CXF-Core.jsonld generation', function () {
    mo.it('check CXF-Core.jsonld generation and comparison', async () => {
      await checkCxfCoreGeneration()
    })
  })
  mo.describe('Testing CXF export from Modelica models ("modelica" mode)', function () {
    // Each entry is a valid model in the ModelicaMode package together with the
    // CXF files its export produces (the enclosing model and the CDL control
    // block class). Covers controllers redeclared in an extends clause
    // (templates), a direct control instance, and a control instance nested in
    // a sub-model.
    const cases = [
      {
        message: 'template redeclaring its control block to G36 in an extends clause',
        moFile: 'VAVBoxCoolingOnly.mo',
        outputs: ['VAVBoxCoolingOnly.jsonld', 'G36VAVBoxCoolingOnly.jsonld']
      },
      {
        message: 'template redeclaring its control block to an open loop controller',
        moFile: 'VAVBoxCoolingOnlyOpenLoop.mo',
        outputs: ['VAVBoxCoolingOnlyOpenLoop.jsonld', 'OpenLoopVAVBoxCoolingOnly.jsonld']
      },
      {
        message: 'a control block instance within a Modelica model',
        moFile: 'ModelWithControlsBlock.mo',
        outputs: ['ModelWithControlsBlock.jsonld', 'SubControllerForControlsExport.jsonld']
      },
      {
        message: 'a control block instance nested within a sub-model',
        moFile: 'ModelWithControlsBlock2.mo',
        outputs: ['ModelWithControlsBlock2.jsonld', 'SubControllerForControlsExport.jsonld']
      }
    ]
    cases.forEach(({ message, moFile, outputs }) => {
      checkCxfFromModelica(
        'Testing CXF from ' + message,
        path.join('test', 'ModelicaMode', moFile),
        outputs.map(o => path.join('test', 'ModelicaMode', o))
      )
    })
  })
  mo.describe('Testing call to getJsons', function () {
    const moFile = path.join(path.join(__dirname, 'FromModelica', 'Enable.mo'))
    const jsons = pa.getJsons([moFile], 'json', 'current', false)
    mo.it('Checking the Modelica class names in the returned array', function () {
      // full class names are generated by string replacement in the modelica file path
      const classNames = jsons.map(({ modelicaFile }) => modelicaFile).map(
        (el) => el.replace(/\//g, '.').replace(/\.mo/, '').replace(/^.*\.Buildings\./, 'Buildings.'))
      const classNamesRef = [
        'test.FromModelica.Enable',
        'Buildings.Controls.OBC.CDL.Interfaces.RealInput',
        'Buildings.Controls.OBC.CDL.Interfaces.BooleanInput',
        'Buildings.Controls.OBC.CDL.Interfaces.IntegerInput',
        'Buildings.Controls.OBC.CDL.Interfaces.RealOutput',
        'Buildings.Controls.OBC.CDL.Logical.TrueFalseHold',
        'Buildings.Controls.OBC.CDL.Interfaces.BooleanOutput',
        'Buildings.Controls.OBC.CDL.Logical.And',
        'Buildings.Controls.OBC.CDL.Reals.Subtract',
        'Buildings.Controls.OBC.CDL.Reals.Hysteresis',
        'Buildings.Controls.OBC.CDL.Reals.Switch',
        'Buildings.Controls.OBC.CDL.Logical.Not',
        'Buildings.Controls.OBC.CDL.Integers.Equal',
        'Buildings.Controls.OBC.CDL.Logical.TrueDelay',
        'Buildings.Controls.OBC.CDL.Integers.Sources.Constant',
        'Buildings.Controls.OBC.CDL.Interfaces.IntegerOutput',
        'Buildings.Controls.OBC.CDL.Logical.Sources.Constant',
        'Buildings.Controls.OBC.CDL.Logical.Or'
      ]
      as.deepStrictEqual(
        JSON.stringify(classNames.sort()),
        JSON.stringify(classNamesRef.sort()),
        `Processing ${moFile} with getJsons returned the wrong class names`)
    })
  })
})
