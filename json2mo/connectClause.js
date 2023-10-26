function parse (content, rawJson = false) {
  const componentReferenceParser = require('./componentReference')

  let moOutput = ''
  moOutput += 'connect('
  if (content.from != null) {
    moOutput += componentReferenceParser.parse(content.from, rawJson)
  }
  if (content.to != null) {
    moOutput += ', '
    moOutput += componentReferenceParser.parse(content.to, rawJson)
  }
  moOutput += ')'
  return moOutput
}

module.exports = { parse }
