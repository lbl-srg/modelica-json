function parse (content, rawJson = false) {
  const util = require('util')
  const compositionParser = require('./composition')
  const classModificationParser = require('./classModification')

  const identifier = content.identifier
  const isExtends = content.is_extends

  let moOutput = ''

  if (isExtends != null) {
    if (isExtends) {
      moOutput += 'extends '
    }
  }

  if (identifier != null) {
    moOutput += util.format('%s', identifier)
  }

  if (isExtends != null) {
    if (isExtends) {
      if (content.class_modification != null) {
        moOutput += classModificationParser.parse(content.class_modification, rawJson)
      }
    }
  }

  if (rawJson) {
    const stringComment = content.string_comment
    if (stringComment != null) {
      moOutput += util.format('\n%s\n', stringComment)
    }
  } else {
    const descriptionString = content.description_string
    if (descriptionString != null) {
      moOutput += util.format('\n"%s"\n', descriptionString)
    }
  }

  if (content.composition != null) {
    moOutput += compositionParser.parse(content.composition, rawJson)
  }

  moOutput += util.format('end %s;', identifier)
  return moOutput
}

module.exports = { parse }
