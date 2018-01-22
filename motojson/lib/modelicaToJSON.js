'use strict'

const pa = require('path')
const cp = require('child_process')
const tmp = require('tmp')
const fs = require('fs')
const fse = require('fs-extra')
const find = require('find')

/** Get the JSON data structure of the JSON file.
  *
  *@param jsonFile Name of the JSON file.
  *@return The JSON representation of the JSON file.
  */
function getJson (jsonFile) {
  const contents = fs.readFileSync(jsonFile, 'utf8')
  return JSON.parse(contents)
}

/** Parses the modelica file.
  *@param {String} modelicaFile Name of the Modelica file.
  *@@return A JSON representation of the Modelica file.
  */
function toJSON (modelicaFile) {
  const parser = pa.join(__dirname, '..', 'java', 'moParser.jar')

  const temDir = tmp.dirSync({prefix: 'modelica-json-'})
  try {
    cp.execFileSync('java',
      ['-jar',
        parser,
        '--mo',
        modelicaFile,
        '--out-dir', temDir.name + pa.sep])
  } catch (error) {
    console.log('*** Error when parsing ' + modelicaFile + ': ' + error.message)
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
