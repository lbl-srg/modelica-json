function parse (content, rawJson) {
  const declarationParser = require('./declaration')
  const commentParser = require('./comment')

  let moOutput = ''
  if (content.declaration != null) {
    moOutput += declarationParser.parse(content.declaration, rawJson)
  }
  if (rawJson) {
    if (content.comment != null) {
      moOutput += commentParser.parse(content.comment, rawJson)
    }
  } else {
    if (content.description != null) {
      moOutput += commentParser.parse(content.description, rawJson)
    }
  }

  return moOutput
}
module.exports = { parse }
