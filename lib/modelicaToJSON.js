'use strict'
const pa = require('path')
const cp = require('child_process')
const tmp = require('tmp')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const find = require('find')
const ut = require('../lib/util')
const rimraf = require('rimraf')
var logger = require('winston')

  //  .then(
  //    function (content) {
  //      logger.debug('Read ' + jsonFile)
   //     return {'aaaa': 'bbbb'} /// JSON.parse(content)
   //   })
   // .catch(function (error) {
   //   logger.err('Error when reading ' + jsonFile)
    //  throw error
   // })

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

  const temDir = tmp.dirSync({prefix: 'modelica-json-'})
  logger.debug('Invoking parser for ' + modelicaFile)
  try {
    cp.execFileSync('java',
      ['-jar',
        parser,
        '--mo',
        modelicaFile,
        '--out-dir', temDir.name + pa.sep])
  } catch (error) {
    const msg = '*** Error when parsing ' + modelicaFile + ': ' + error.message
    logger.error(msg)
    throw new Error(msg)
  }
  // Read the json file
  const jsonFiles = find.fileSync(/\.json$/, temDir.name)

  if (jsonFiles.length !== 1) {
    const msg = '*** Error: Parsing ' + modelicaFile + ' created ' + jsonFiles.length + ' files, rather than 1.\n  Check directory ' + temDir.name
    logger.error(msg)
    throw new Error(msg)
  }

  return ut.readJSON(jsonFiles[0])
    .then(function (json) {
      rimraf(temDir.name, function () { })
      return json
    })
//    .catch(function (err) {
//      logger.error('Error when parsing ' + modelicaFile)
//      throw err
//    })
}

module.exports.toJSON = toJSON
