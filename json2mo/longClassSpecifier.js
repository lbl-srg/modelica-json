function parse (content, rawJson = false) {
  const util = require('util')
  const compositionParser = require('./composition')
  const classModificationParser = require('./classModification')

  var identifier = content.identifier
  var isExtends = content.is_extends

  var moOutput = ''

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
    var stringComment = content.string_comment
    if (stringComment != null) {
      moOutput += util.format('\n%s\n', stringComment)
    }
  } else {
    var descriptionString = content.description_string
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

module.exports = {parse}
