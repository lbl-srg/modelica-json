const fs = require('fs')
var logger = require('winston')

function writeFile (fileName, content) {
  fs.writeFile(fileName, content, function (err) {
    if (err) {
      logger.error(err)
      throw new Error(err)
    }
    logger.info('Wrote ' + fileName)
  })
}
module.exports.writeFile = writeFile
