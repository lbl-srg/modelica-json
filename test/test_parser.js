'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const pa = require('../lib/parser')
const ut = require('../lib/util')
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

/** Function that checks parsing from Modelica to JSON
  */
var checkJSON = function (outFormat, extension, message) {
  process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    setTimeout(2000) // avoid time out error as these tests take a while
    const pattern = path.join(__dirname, 'FromModelica', '*.mo')
    const testMoFiles = glob.sync(pattern)
    return Promise.all(testMoFiles).then(files => {
      // files are all .mo files to be parsed
      return Promise.all(files.map(fil => {
        return pa.getJSON(fil, outFormat)
        .then(jsonSimple => {
          // Read the stored json representation from disk
          // logger.error('jsonSimple =' + JSON.stringify(jsonSimple, null, 2))
          const oldFil = fil.slice(0, -3) + extension
          // Read the old json
          return ut.readJSON(oldFil).then(function (jsonOld) {
            as.deepEqual(jsonSimple[0], jsonOld[0], 'JSON result differs for ' + fil)
          })
        })
      }))
    })
  })
}

mo.describe('parser.js', function () {
  mo.describe('Testing parse from Modelica', function () {
    checkJSON('json-simplified', '-simplified.json', 'Testing simplified json for equality')
    checkJSON('json', '.json', 'Testing unmodified json for equality')
  })
})
