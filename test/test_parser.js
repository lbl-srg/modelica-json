'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const pa = require('../lib/parser')
const ht = require('../lib/htmlWriter')
const ut = require('../lib/util')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const glob = require('glob-promise')
var logger = require('winston')

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
var getMoFiles = function (mode) {
  if (mode === 'cdl') {
    const pattern = path.join(__dirname, 'FromModelica', '*.mo')
    return glob.sync(pattern)
  } else if (mode === 'modelica') {
    return path.join(__dirname, 'FromModelica')
  }
}

/** Function that checks parsing from Modelica to JSON
  */
var checkJSON = function (outFormat, mode, extension, message) {
  process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files array or package to be tested.
    const testMoFiles = getMoFiles(mode)
    // Name of subpackage to store json output files
    var subPackName = (outFormat === 'json' ? 'json' : 'simplified')

    // When parsing mode is 'cdl', the moFiles should feed into parser one-by-one
    if (mode === 'cdl') {
      testMoFiles.filter(function (obj) {
        return !obj.includes('package.mo')
      })
      testMoFiles.map(fil => {
        const jsonNewCDL = pa.getJSON(fil, mode, outFormat)
        var idx = fil.lastIndexOf(path.sep)
        // Read the stored json representation from disk
        const oldFilCDL = path.join(fil.slice(0, idx), mode, subPackName,
                                    fil.slice(idx + 1, -3) + extension)
        // Read the old json
        const jsonOldCDL = JSON.parse(fs.readFileSync(oldFilCDL, 'utf8'))
        const oldCDL = jsonOldCDL
        const neCDL = (outFormat === 'json') ? jsonNewCDL : jsonNewCDL[0]
        // Update the path to be relative to the project home.
        // This is needed for the regression tests to be portable.
        if (neCDL.modelicaFile) {
          neCDL['modelicaFile'] = neCDL['modelicaFile'].replace(path.join(__dirname, 'FromModelica'), '.')
        }
        as.notEqual(oldCDL, undefined, 'JSON is undefined')
        as.deepEqual(neCDL, oldCDL, 'JSON result differs for ' + oldFilCDL)
      })

    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    } else if (mode === 'modelica') {
      const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)
      const moFiles = glob.sync(path.join(testMoFiles, '*.mo')).filter(function (obj) {
        return !obj.includes('package.mo')
      })
      for (var i = 0; i < moFiles.length; i++) {
        var idx2 = moFiles[i].lastIndexOf(path.sep)
        const fileNameMOD = moFiles[i].slice(idx2 + 1, -3) + extension
        // Read the stored json representation from disk
        const oldFileMOD = path.join(moFiles[i].slice(0, idx2), mode, subPackName, fileNameMOD)
        // Read the old json
        const jsonOldMOD = JSON.join(fs.readFileSync(oldFileMOD, 'utf8'))
        // Find the corresponded new json file
        const neMOD = jsonNewMOD.filter(function (obj) {
          var fileNameBase = fileNameMOD.slice(0, -5)
          if (mode === 'json-simplified') {
            return obj.topClassName === fileNameBase
          } else if (mode === 'json') {
            const tempName = obj.modelicaFile.slice(0, -3).replace(path.sep, '.')
            return tempName === fileNameBase
          }
        })
        if (neMOD.modelicaFile) {
          neMOD['modelicaFile'] = neMOD['modelicaFile'].replace(path.join(__dirname, 'FromModelica'), '.')
        }
        as.notEqual(jsonOldMOD, undefined, 'JSON is undefined')
        as.deepEqual(neMOD, jsonOldMOD, 'JSON result differs for ' + oldFileMOD)
      }
    }
  })
}

/** Function that return html data array
  */
var getHtml = function (files, mode) {
  const moFiles = (mode === 'cdl') ? files.split()
                                   : ut.getMoFiles(mode, files)
  const json = pa.getJSON(files, mode, 'html')
  const outFile = ut.getOutFile(mode, files, 'html', moFiles, json)
  const html = ht.getHtmlPage(outFile, json, mode)
  return html
}

/** Function that check parsing from Modelica to html
  */
var compareHtml = function (mode) {
  process.env.MODELICAPATH = __dirname
  mo.it('Testing html for equality', () => {
    // Array of mo files to be tested.
    const testMoFiles = getMoFiles(mode)

    // When parsing mode is 'cdl', there will be one html for each mo file
    if (mode === 'cdl') {
      testMoFiles.filter(function (obj) {
        return !obj.includes('package.mo')
      })
      testMoFiles.map(fil => {
        const htmlCDL = getHtml(fil, mode)
        // Get stored html files
        var idx = fil.lastIndexOf(path.sep)
        const htmlFil = path.join(fil.slice(0, idx), mode, 'html',
                                  fil.slice(idx + 1, -3) + '.html')
        const oldHtml = fs.readFileSync(htmlFil, 'utf8')
        as.equal(htmlCDL[0], oldHtml, 'html representation differs for ' + htmlFil)
      })

    // When parsing mode is 'modelica', there will be one html for each package
    } else if (mode === 'modelica') {
      const htmlMOD = getHtml(testMoFiles, mode)
      // Get stored html files
      const pattern = path.join(__dirname, 'FromModelica', 'modelica', 'html', '*.html')
      const oldHtmlMODPath = glob.sync(pattern)
      if (htmlMOD.length === oldHtmlMODPath.length) {
        for (var i = 0; i < oldHtmlMODPath.length; i++) {
          const oldHtmlMOD = fs.readFileSync(oldHtmlMODPath[i], 'utf8')
          as.equal(htmlMOD[i], oldHtmlMOD, 'html representation differs for ' + oldHtmlMODPath[i])
        }
      }
    }
  })
}

mo.describe('parser.js', function () {
  mo.describe('Testing parse from Modelica, in "cdl" parsing mode', function () {
    checkJSON('json', 'cdl', '.json', 'Testing unmodified json for equality')
  })
  mo.describe('Testing parse from Modelica, in "modelica" parsing mode', function () {
    checkJSON('json', 'modelica', '.json', 'Testing unmodified json for equality')
  })
  mo.describe('Testing parse from Modelica, in "cdl" parsing mode', function () {
    checkJSON('json-simplified', 'cdl', '.json', 'Testing simplified json for equality')
  })
  mo.describe('Testing parse from Modelica, in "modelica" parsing mode', function () {
    checkJSON('json-simplified', 'modelica', '.json', 'Testing simplified json for equality')
  })
  mo.describe('Testing html generation from Modelica, in "cdl" parsing mode', compareHtml('cdl'))
  mo.describe('Testing html generation from Modelica, in "modelica" parsing mode', compareHtml('modelica'))
})
