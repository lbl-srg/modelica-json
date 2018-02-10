'use strict'
const pa = require('path')
const exec = require('child-process-promise').exec
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
  return exec('java -jar ' + parser + ' --mo ' +
              modelicaFile)
      .catch(function (error) {
        const msg = '*** Error when parsing ' + modelicaFile + ': ' + error.message
        logger.error(msg)
        throw new Error(msg)
      })
      .then(function (result) {
        // stdout is a JSON string that has the model structure
        try {
          var res = JSON.parse(result.stdout)
          // Add the modelica file name, as this is needed to look up its instances
          res.modelicaFile = modelicaFile
          return res
        } catch (error) {
          const em = error + '\n JSON structure is \n' + result.stdout
          logger.error(em)
          throw new SyntaxError(em)
        }
      })
}

module.exports.toJSON = toJSON
