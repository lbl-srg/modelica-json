function parse (content, rawJson = false) {
  const declarationParser = require('./declaration')
  const conditionAttributeParser = require('./condition_attribute')
  const commentParser = require('./comment')

  var moOutput = ''
  if (content.declaration != null) {
    moOutput += declarationParser.parse(content.declaration, rawJson)
  }
  if (content.condition_attribute != null) {
    moOutput += conditionAttributeParser.parse(content.condition_attribute, rawJson)
  }
  if (content.comment != null) {
    moOutput += commentParser.parse(content.comment, rawJson)
  }
  return moOutput
}

module.exports = {parse}
