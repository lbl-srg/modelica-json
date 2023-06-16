function parse (content, rawJson = false) {
  const simpleExpressionParser = require('./simpleExpression')
  const ifExpressionParser = require('./ifExpression')
  let moOutput = ''

  if (content.if_expression != null) {
    moOutput += ifExpressionParser.parse(content.if_expression, rawJson)
  } else if (content.simple_expression != null) {
    moOutput += simpleExpressionParser.parse(content.simple_expression, rawJson)
  }

  return moOutput
}

module.exports = { parse }
