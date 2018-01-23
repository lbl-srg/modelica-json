'use strict'
const pa = require('path')
const cp = require('child_process')
const tmp = require('tmp')
const fs = require('fs')
const fse = require('fs-extra')
const find = require('find')
var logger = require('winston')

/** Get the JSON data structure of the JSON file.
  *
  *@param jsonFile Name of the JSON file.
  *@return The JSON representation of the JSON file.
  */
function getJson (jsonFile) {
  return JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
}

/** Parses the modelica file.
  *@param {String} modelicaFile Name of the Modelica file.
  *@@return A JSON representation of the Modelica file.
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
    console.log('*** Error: Parsing ' + modelicaFile + ' created ' + jsonFiles.length + ' files, rather than 1.\n  Check directory ' + temDir.name)
    return undefined
  }

  const json = getJson(jsonFiles[0])
  // Delete temp directory
  fse.remove(temDir.name, err => {
    if (err) return console.error(err)
  })

  return json
}

module.exports.toJSON = toJSON
