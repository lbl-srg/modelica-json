function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const forIndiceObjParser = require('./forIndicesObj')

  let moOutput = ''
  if (content != null) {
    moOutput += '{'
    moOutput += expressionParser.parse(content.expression, rawJson)
    moOutput += ' for '
    moOutput += forIndiceObjParser.parse(content.for_loop, rawJson)
    moOutput += '}'
  }
  return moOutput
}

module.exports = { parse }
