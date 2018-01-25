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

mo.describe('parser.js', function () {
  mo.describe('parse from Modelica', function () {
    mo.it('json files should be equal', () => {
      const pattern = path.join(__dirname, 'FromModelica', '*.mo')
      const testMoFiles = glob.sync(pattern)
      return Promise.all(testMoFiles).then(files => {
        // files are all .mo files to be parsed
        return Promise.all(files.map(fil => {
          return pa.getJSON(fil, 'json-simplified')
        }))
      .then(jsonSimple => {
        // Read the stored json representation from disk
        return Promise.all(jsonSimple.map(entry => {
          const oldFil = path.join(__dirname, (entry[0].topClassName.replace(/\./g, path.sep) + '-simplified.json'))

          // Read the old json
          return ut.readJSON(oldFil).then(function (jsonOld) {
            as.deepEqual(entry[0], jsonOld[0], 'JSON result differs from file for ' + entry[0].topClassName)
          })
          .catch(function (error) {
            console.log(error)
            return Promise.reject(error)
          })
        })
          )
      })
      })
      // .catch(as.equal(false, true, 'Error in parsing json.'))
    }) // end of it
  }) // end of describe
})
