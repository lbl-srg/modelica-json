function parse (content, rawJson = false) {
  const expressionParser = require('./expression')

  var moOutput = ''

  if (rawJson) {
    moOutput += '['

    if (content.colon_op != null) {
      moOutput += ':'
    } else if (content.expression != null) {
      moOutput += expressionParser.parse(content.expression, rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
