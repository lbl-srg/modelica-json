function parse (content, rawJson = false) {
  const componentReferenceParser = require('./componentReference')
  const expressionParser = require('./expression')

  let moOutput = ''
  if (content.identifier != null) {
    moOutput += componentReferenceParser.parse(content.identifier, rawJson)
  }
  moOutput += ':='
  if (content.value != null) {
    moOutput += expressionParser.parse(content.value, rawJson)
  }
  return moOutput
}

module.exports = { parse }
