function parse (content, rawJson = false) {
  const simpleExpression = require('./simpleExpression')
  const expressionParser = require('./expression')

  let moOutput = ''
  if (content.lhs != null) {
    moOutput += simpleExpression.parse(content.lhs, rawJson)
  }
  moOutput += '='
  if (content.rhs != null) {
    moOutput += expressionParser.parse(content.rhs, rawJson)
  }
  return moOutput
}

module.exports = { parse }
