function parse (content, rawJson = false) {
  const util = require('util')
  const expressionParser = require('./expression')

  var moOutput = ''
  if (rawJson) {
    if (content.identifier != null) {
      moOutput += util.format('%s ', content.identifier)
    }
    if (content.expression != null) {
      moOutput += 'in '
      moOutput += expressionParser.parse(content.expression, rawJson)
    }
    moOutput += ','
  }
  return moOutput
}

module.exports = {parse}
