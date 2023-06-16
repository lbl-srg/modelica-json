function parse (content, rawJson = false) {
  const expressionParser = require('./expression')

  let moOutput = ''
  let outputExpressions = null
  if (rawJson) {
    outputExpressions = content.output_expressions
  } else {
    outputExpressions = content
  }
  if (outputExpressions != null) {
    outputExpressions.forEach(expression => {
      moOutput += expressionParser.parse(expression, rawJson)
      moOutput += ', '
    })
    moOutput = moOutput.slice(0, -1)
  }
  return moOutput
}

module.exports = { parse }
