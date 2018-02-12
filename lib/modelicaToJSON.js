'use strict'
const pa = require('path')
const pro = require('child_process')
const fs = require('bluebird').promisifyAll(require('fs'))
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

  logger.debug('Invoking parser for ' + modelicaFile)

  // call synchronously
  const jr = pro.spawnSync('java', ['-jar', parser, '--mo', modelicaFile])
  if (jr.stderr.length > 0) {
    const msg = '*** Error when parsing ' + modelicaFile + ': "' + jr.stderr + '".'
    logger.error(msg)
    throw new Error(msg)
  } else {
    try {
      var res = JSON.parse(jr.stdout)
      // Add the modelica file name, as this is needed to look up its instances
      if (!res) throw new Error('Parser return null instead of json structure. Did you install Java properly?')
      res.modelicaFile = modelicaFile
      return res
    } catch (error) {
      const em = error + '\n JSON structure is \n' + jr.stdout
      logger.error(em)
      throw new SyntaxError(em)
    }
  }
}

module.exports.toJSON = toJSON
