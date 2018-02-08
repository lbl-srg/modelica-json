'use strict'
const pa = require('path')
const exec = require('child-process-promise').exec
const tmp = require('tmp-promise')
const fs = require('bluebird').promisifyAll(require('fs'))
const find = require('find-promise')
const ut = require('../lib/util')
const rimraf = require('rimraf')
var logger = require('winston')

/** Parses the modelica file and returns a promise.
  *
  *@param {String} modelicaFile Name of the Modelica file.
  *@return A JSON representation of the Modelica file.
  */
function toJSON (modelicaFile) {
  const parser = pa.join(__dirname, '..', 'java', 'moParser.jar')

  if (!fs.existsSync(parser)) {
    const msg = 'Modelica parser ' + parser + ' does not exist. Did you install the software correctly.'
    logger.error(msg)
    throw new Error(msg)
  }

  if (!fs.existsSync(modelicaFile)) {
    const msg = "Modelica file '" + modelicaFile + "' does not exist."
    logger.error(msg)
    throw new Error(msg)
  }

//  const temDir = tmp.dirSync({prefix: 'modelica-json-'})
  logger.debug('Invoking parser for ' + modelicaFile)
  return tmp.dir({prefix: 'modelica-json-'})
    .then(function (temDir) {
      return exec('java -jar ' + parser + ' --mo ' +
                modelicaFile + ' --out-dir ' + temDir.path + pa.sep)
        .catch(function (error) {
          const msg = '*** Error when parsing ' + modelicaFile + ': ' + error.message
          logger.error(msg)
          throw new Error(msg)
        })
      .catch(err => {
        logger.error('Failed to create temporary directory. ' + err)
        throw new Error('Failed to create temporary directory.' + err)
      })
      .then(function (result) {
        // Check if there is exactly one json file written, and then return its name

//        fs.readdir(temDir.path, function(err, items) {
//            console.log('*****^^^^^^^^^^^^^^^^^^^^ items: ', items)
//
//            for (var i=0; i<items.length; i++) {
//                console.log('****^^^^^^^^^^^^^^^^^ files: ', items[i])
//            }
//        })

        return find.file(/\.json$/, temDir.path)
          .then(function (jsonFiles) {
            if (jsonFiles.length !== 1) {
              const msg = '*** Error: Parsing ' + modelicaFile + ' created ' + jsonFiles.length + '   files,   rather than 1.\n  Check directory ' + temDir.path
              logger.error(msg)
              throw new Error(msg)
            }
            return jsonFiles[0]
          })
      })
      .then(function (jsonFile) {
        return ut.readJSON(jsonFile)
      })
      .then(function (json) {
        rimraf(temDir.path, function () { })
        return json
      })
    })
}

module.exports.toJSON = toJSON
