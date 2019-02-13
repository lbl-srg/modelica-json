'use strict'
const pa = require('path')
const pro = require('child_process')
const fs = require('bluebird').promisifyAll(require('fs'))
var logger = require('winston')

/** Parses the modelica file and returns a promise.
  *
  *@param {String} modelicaFile Name of the Modelica file.
  *@param {String} MOP system variable MODELICAPATH
  *@return A JSON representation of the Modelica file.
  */
function toJSON (modelicaFile, MOP) {
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
      res.modelicaFile = relativeFilePath(modelicaFile, MOP)
      return res
    } catch (error) {
      const em = error + '\n JSON structure is \n' + jr.stdout
      logger.error(em)
      throw new SyntaxError(em)
    }
  }
}

/** Return the file path relative to MODELICAPATH if it is found from the system
  * default Modelica library
  *
  *@param {String} filePath file path
  *@param {String} MOP MODELICAPATH
  *@return relative file path to Modelica library
  */
function relativeFilePath (filePath, MOP) {
  var paths = (process.cwd() + ':' + MOP).split(':')
  var bases = []
  paths.forEach(ele => {
    bases.push(pa.parse(ele).base)
  })
  var relativePath = filePath
  for (var i = 0; i < bases.length; i++) {
    if (filePath.includes(bases[i])) {
      relativePath = filePath.substring(filePath.indexOf(bases[i]))
    }
  }
  return relativePath
}

module.exports.toJSON = toJSON
