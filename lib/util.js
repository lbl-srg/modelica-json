const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

var logger = require('winston')

function writeFile (fileName, content) {
  console.log('Enter writing ....')
  fs.writeFileAsync(fileName, content).then(
    function (res) {
      logger.debug('Wrote ', fileName)
      return true
    }
  )
}

module.exports.writeFile = writeFile
