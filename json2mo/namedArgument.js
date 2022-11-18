function parse (content, rawJson = false) {
  const util = require('util')
  const functionArgumentParser = require('./functionArgument')

  var moOutput = ''
  if (content.identifier != null) {
    moOutput += util.format('%s=', content.identifier)
  }
  if (content.value != null) {
    moOutput += functionArgumentParser.parse(content.value, rawJson)
  }

  return moOutput
}

module.exports = {parse}
