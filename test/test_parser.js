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
// const cheerio = require('cheerio')

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
const getIntFiles = function (mode) {
  let pattern
  if (mode === 'cdl') {
    pattern = path.join(__dirname, 'FromModelica', '*.mo')
    return glob.sync(pattern)
  } else if (mode === 'modelica') {
    return path.join(__dirname, 'FromModelica')
  }
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

    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference')

    testMoFiles.forEach(fil => {
      // 'fil.split()' changes string 'fil' to be string array with single element
      // 'fil' is like '../test/FromModelica/***.mo'
      // const jsonNewCDL = pa.getJSON(fil.split(), mode, outFormat)
      pa.getJsons([fil], mode, outFormat, 'current', 'false')
      const idx = fil.lastIndexOf(path.sep)
      const jsonNewCDLFile = path.join(process.cwd(), subPackName, 'test', 'FromModelica', fil.slice(idx + 1, -3) + extension)

      // Read the stored json representation from disk
      // It's like '../test/FromModelica/cdl/json/***.json'
      const oldFilCDL = path.join(expectedOutputPath, subPackName, 'test', 'FromModelica', fil.slice(idx + 1, -3) + extension)

      // const oldFilCDL = path.join(packBase, mode, subPackName,
      //   tempName[tempName.length - 1] +
      //                             '.' +
      //                             fil.slice(idx + 1, -3) + extension)
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
  })
}

/** Function that checks parsing from Modelica to JSON, in 'modelica' parsing mode
  */
const checkModJSON = function (outFormat, extension, message) {
  const mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files package to be tested
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = ut.getMoFiles(testMoFilesTemp)

    // Name of subpackage to store json output files
    const subPackName = (outFormat === 'raw-json' ? 'raw-json' : 'json')
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    // const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
    pa.getJsons(testMoFiles, mode, outFormat, 'current', 'false')
    const pattern = path.join('test', 'FromModelica', '*.mo')
    const files = glob.sync(pattern)
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference')

    for (let i = 0; i < files.length; i++) {
      const idx2 = files[i].lastIndexOf(path.sep)
      const fileNameMOD = files[i].slice(idx2 + 1, -3) + extension
      const oldFileMOD = path.join(expectedOutputPath, subPackName, 'test', 'FromModelica', fileNameMOD)
      // Read the old json
      const jsonOldMOD = JSON.parse(fs.readFileSync(oldFileMOD, 'utf8'))

      if (jsonOldMOD.modelicaFile) {
        jsonOldMOD.fullMoFilePath = jsonOldMOD.modelicaFile.split('modelica-json/')[1]
      }
      const jsonNewMOD = path.join(process.cwd(), subPackName, 'test', 'FromModelica', fileNameMOD)
      const neMOD = JSON.parse(fs.readFileSync(jsonNewMOD, 'utf8'))
      if (neMOD.modelicaFile) {
        neMOD.fullMoFilePath = neMOD.modelicaFile.split('modelica-json/')[1]
      }

      const tempOld = JSON.stringify(jsonOldMOD)
      const tempNew = JSON.stringify(neMOD)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFileMOD)
    }
  })
}

/** Function that checks parsing from Modelica to Objects Json, in 'modelica' parsing mode
  */
const checkObjectsJSON = function (outFormat, extension, message) {
  const mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files package to be tested
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = ut.getMoFiles(testMoFilesTemp)

    // Name of subpackage to store json output files
    const subPackName = 'objects'
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    // const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
    pa.getJsons(testMoFiles, mode, outFormat, 'current', 'false')
    const pattern = path.join('test', 'FromModelica', '*.mo')
    const files = glob.sync(pattern)
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference', subPackName, 'test', 'FromModelica')
    const actualOutputPath = path.join(process.cwd(), subPackName, 'test', 'FromModelica')

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
  })
}

/** Function that checks parsing from Modelica to Objects Json, in 'modelica' parsing mode
  */
const checkCxfJson = function (outFormat, extension, message) {
  const mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files package to be tested
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = ut.getMoFiles(testMoFilesTemp)

    // Name of subpackage to store json output files
    const subPackName = 'cxf'
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    // const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
    pa.getJsons(testMoFiles, mode, outFormat, 'current', 'false')
    const pattern = path.join('test', 'FromModelica', '*.mo')
    const files = glob.sync(pattern)
    const filesToExclude = glob.sync(path.join('test', 'FromModelica', 'ExtendsClause*'))
    const expectedOutputPath = path.join(process.cwd(), 'test', 'reference', subPackName, 'test', 'FromModelica')
    const actualOutputPath = path.join(process.cwd(), subPackName, 'test', 'FromModelica')

    for (let i = 0; i < files.length; i++) {
      const idx2 = files[i].lastIndexOf(path.sep)
      const fileNameMOD = files[i].slice(idx2 + 1, -3) + extension
      if (!filesToExclude.includes(files[i])) {
        const oldFileMOD = path.join(expectedOutputPath, fileNameMOD)
        // Read the old json
        const jsonOldMOD = JSON.parse(fs.readFileSync(oldFileMOD, 'utf8'))

        const jsonNewMOD = path.join(actualOutputPath, fileNameMOD)
        const neMOD = JSON.parse(fs.readFileSync(jsonNewMOD, 'utf8'))

        const tempOld = JSON.stringify(jsonOldMOD)
        const tempNew = JSON.stringify(neMOD)
        as.notEqual(tempOld, undefined, 'JSON is undefined')
        as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFileMOD)
      } else {
        const jsonLdPath = path.join(actualOutputPath, fileNameMOD)
        as.throws(function () { fs.readFileSync(jsonLdPath, 'utf8') }, Error, 'asd')
      }
    }
  })
}

function checkCxfCoreGeneration () {
  const cdlPath = path.join('Buildings', 'Controls', 'OBC', 'CDL')
  const testMoFiles = ut.getMoFiles(cdlPath)
  pa.getJsons(testMoFiles, 'cdl', 'cxf', 'current', true, true, true)
  ce.getCxfCore(path.join(process.cwd(), cdlPath), 'current', true)

  const actualOutputCxfCorePath = path.join(process.cwd(), 'cxf', 'CXF-Core.jsonld')
  const actualOutputCxfCore = JSON.stringify(JSON.parse(fs.readFileSync(actualOutputCxfCorePath, 'utf8')))

  const refOutputCxfCorePath = path.join(process.cwd(), 'test', 'reference', 'cxf', 'CXF-Core.jsonld')
  const refOutputCxfCore = JSON.stringify(JSON.parse(fs.readFileSync(refOutputCxfCorePath, 'utf8')))

  as.deepEqual(actualOutputCxfCore, refOutputCxfCore, 'CXF-Core.jsonld different for generated file=' + actualOutputCxfCorePath + ' and reference file=' + refOutputCxfCorePath)
}

mo.describe('parser.js', function () {
  mo.describe('Testing Modelica to raw-json in "cdl" parsing mode', function () {
    checkCdlJSON('raw-json', '.json', 'Testing unmodified json for equality, "cdl" mode')
  })
  mo.describe('Testing Modelica to raw-json, in "modelica" parsing mode', function () {
    checkModJSON('raw-json', '.json', 'Testing unmodified json for equality, "modelica" mode')
  })
  mo.describe('Testing Modelica to JSON, in "cdl" parsing mode', function () {
    checkCdlJSON('json', '.json', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing Modelica to JSON, in "modelica" parsing mode', function () {
    checkModJSON('json', '.json', 'Testing json for equality, "modelica" mode')
  })
  mo.describe('Testing parse from Modelica to Objects Json, in "cdl" parsing mode', function () {
    checkObjectsJSON('semantic', '.json', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing parse from Modelica to CXF JsonLD, in "cdl" parsing mode', function () {
    checkCxfJson('cxf', '.jsonld', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing CXF-Core.jsonld generation', function () {
    mo.it('check CXF-Core.jsonld generation and comparison', () => {
      checkCxfCoreGeneration()
    })
  })
  mo.describe('Testing call to getJsons, in "modelica" parsing mode', function () {
    const moFile = path.join(getIntFiles('modelica'), 'Enable.mo')
    const jsons = pa.getJsons([moFile], 'modelica', 'json', 'current', false)
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
