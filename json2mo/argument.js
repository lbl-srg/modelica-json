function parse (content, rawJson = false) {
  const elementModificationOrReplaceable = require('./elementModificationOrReplaceable')
  const elementRedeclaration = require('./elementRedeclaration')

  let moOutput = ''
  if (content.element_modification_or_replaceable != null) {
    moOutput += elementModificationOrReplaceable.parse(content.element_modification_or_replaceable, rawJson)
  } else if (content.element_redeclaration != null) {
    moOutput += elementRedeclaration.parse(content.element_redeclaration, rawJson)
  }
  return moOutput
}

module.exports = { parse }
