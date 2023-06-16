'use strict'
const pa = require('path')
const pro = require('child_process')
const fs = require('bluebird').promisifyAll(require('fs'))
const logger = require('winston')
const ut = require('../lib/util.js')

/** Parses the modelica file and returns a promise.
  *
  *@param {String} modelicaFile full path of modelica file to be parsed
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
    const msg = "Modelica file '" + modelicaFile + "' not found. You may need to set the MODELICAPATH environment variable."
    logger.error(msg)
    throw new Error(msg)
  }

  logger.debug('Invoking parser for ' + modelicaFile)

  // call synchronously
  const jr = pro.spawnSync('java',
    ['-Xmx2048m', '-Xms512m', '-jar', parser, '--mo', modelicaFile], { maxBuffer: 1024 * 1024 * 100 })
  if (jr.stderr.length > 0) {
    const msg = '*** Error when parsing ' + modelicaFile + ': "' + jr.stderr + '".'
    logger.error(msg)
    throw new Error(msg)
  } else {
    try {
      logger.debug('Parsing output to json.')
      const res = JSON.parse(jr.stdout)
      // Add the modelica file name, as this is needed to look up its instances
      if (!res) throw new Error('Parser returned null instead of json structure. Did you install Java properly?')
      Object.assign(res,
        { modelicaFile: ut.relativePath(modelicaFile) },
        { fullMoFilePath: modelicaFile })
      return res
    } catch (error) {
      const em = error + '\n JSON structure is \n' + jr.stdout
      logger.error(em)
      throw new SyntaxError(em)
    }
  }
}

module.exports.toJSON = toJSON
