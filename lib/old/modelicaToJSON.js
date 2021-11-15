'use strict'
const pa = require('path')
const pro = require('child_process')
const fs = require('bluebird').promisifyAll(require('fs'))
var logger = require('winston')

/** Parses the modelica file and returns a promise.
  *
  *@param {String} modelicaFile full path of modelica file to be parsed.
  *@param {String} MODELICAPATH system variable MODELICAPATH
  *@param {String} parseMode parsing mode
  *@return A JSON representation of the Modelica file.
  */
function toJSON (modelicaFile, parseMode, MODELICAPATH) {
  const parser = pa.join(__dirname, '..', 'java', 'moParser.jar')

  if (!fs.existsSync(parser)) {
    const msg = 'Modelica parser ' + parser + ' does not exist. Did you install the software correctly.'
    logger.error(msg)
    throw new Error(msg)
  }
  if (!fs.existsSync(modelicaFile)) {
    var msg
    if (parseMode === 'cdl') {
      msg = "Modelica file '" + modelicaFile + "' not found. You may need to set the MODELICAPATH environment variable."
    } else {
      msg = "Modelica package '" + modelicaFile + "' not found. You may need to set the MODELICAPATH environment variable."
    }
    logger.error(msg)
    throw new Error(msg)
  }

  logger.debug('Invoking parser for ' + modelicaFile)

  // call synchronously
  const jr = pro.spawnSync('java',
    ['-Xmx2048m', '-Xms512m', '-jar', parser, '--mo', modelicaFile])
  if (jr.stderr.length > 0) {
    const msg = '*** Error when parsing ' + modelicaFile + ': "' + jr.stderr + '".'
    logger.error(msg)
    throw new Error(msg)
  } else {
    try {
      logger.debug('Parsing output to json.')
      var res = JSON.parse(jr.stdout)
      // Add the modelica file name, as this is needed to look up its instances
      if (!res) throw new Error('Parser returned null instead of json structure. Did you install Java properly?')
      res.modelicaFile = relativePath(modelicaFile, MODELICAPATH)
      return res
    } catch (error) {
      const em = error + '\n JSON structure is \n' + jr.stdout
      logger.error(em)
      throw new SyntaxError(em)
    }
  }
}

/** Return relative path to MODELICAPATH if it can be found from the system
  * default Modelica library
  *
  *@param {String} filePath full file path
  *@param {String} MODELICAPATH system variable MODELICAPATH
  *@return relative file path to MODELICAPATH
  */
function relativePath (filePath, MODELICAPATH) {
  var paths = MODELICAPATH.split(':')
  var bases = []
  paths.forEach(ele => {
    var temp = pa.parse(ele).base
    if (temp.length > 0) bases.push(temp)
  })
  var relPa = filePath
  for (var i = 0; i < bases.length; i++) {
    if (filePath.includes(bases[i])) {
      relPa = filePath.substring(filePath.indexOf(bases[i]) + bases[i].length + 1)
    }
  }
  return relPa
}

module.exports.toJSON = toJSON
