function parse (content, rawJson = false) {
  const elementModificationParser = require('./elementModification')
  const elementReplaceableParser = require('./elementReplaceable')

  let moOutput = ''
  if (content.each != null) {
    if (content.each) {
      moOutput += 'each '
    }
  }
  if (rawJson) {
    if (content.is_final != null) {
      if (content.is_final) {
        moOutput += 'final '
      }
    }
  } else {
    if (content.final != null) {
      if (content.final) {
        moOutput += 'final '
      }
    }
  }

  if (content.element_modification != null) {
    moOutput += elementModificationParser.parse(content.element_modification, rawJson)
  } else if (content.element_replaceable != null) {
    moOutput += elementReplaceableParser.parse(content.element_replaceable, rawJson)
  }
  return moOutput
}

module.exports = { parse }
