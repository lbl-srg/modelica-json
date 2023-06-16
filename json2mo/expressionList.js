function parse (content, rawJson = false) {
  const expressionParser = require('./expression')

  let moOutput = ''
  let expressionList = null
  if (rawJson) {
    expressionList = content.expressions
  } else {
    expressionList = content
  }
  if (expressionList != null) {
    expressionList.forEach(expression => {
      moOutput += expressionParser.parse(expression, rawJson)
      moOutput += ', '
    })
    moOutput = moOutput.slice(0, -1)
  }
  return moOutput
}

module.exports = { parse }
