const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

var logger = require('winston')

function writeFile (fileName, content) {
  fs.writeFileAsync(fileName, content).then(
    function (res) {
      logger.debug('Wrote ', fileName)
      return true
    }
  )
}

/** Get the JSON data structure of the JSON file.
  *
  *@param jsonFile Name of the JSON file.
  *@return The JSON representation of the JSON file.
  */
function readJSON (jsonFile) {
  logger.debug('Entered getJSON for ', jsonFile)
  const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
  return Promise.resolve(json)
}

module.exports.writeFile = writeFile
module.exports.readJSON = readJSON
