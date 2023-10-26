function parse (content, rawJson = false) {
  const ifElseifExpressionParser = require('./ifElseifExpression')
  const expressionParser = require('./expression')

  let moOutput = ''
  const ifElseifs = content.if_elseif
  if (ifElseifs != null) {
    ifElseifs.forEach(ele => {
      moOutput += ' elseif '
      moOutput += ifElseifExpressionParser.parse(ele, rawJson)
    })
  }
  moOutput = ' ' + moOutput.slice(5, moOutput.length) // to remove 1st else of elseif so that we get "if"

  if (content.else_expression != null) {
    moOutput += ' else '
    moOutput += expressionParser.parse(content.else_expression, rawJson)
  }
  return moOutput
}

module.exports = { parse }
