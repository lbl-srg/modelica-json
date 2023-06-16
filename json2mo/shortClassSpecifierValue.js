function parse (content, rawJson = false) {
  const basePrefixParser = require('./basePrefix')
  const nameParser = require('./name')
  const arraySubscriptsParser = require('./arraySubscripts')
  const classModificationParser = require('./classModification')
  const commentParser = require('./comment')
  const enumListParser = require('./enumList')

  let moOutput = ''

  if (content.name == null) {
    moOutput += 'enumeration ('
    if (content.enum_list != null) {
      moOutput += enumListParser.parse(content.enum_list, rawJson)
    } else {
      moOutput += ':'
    }
    moOutput += ') '
  } else {
    moOutput += basePrefixParser.parse(content.base_prefix, rawJson)
    if (content.name != null) {
      moOutput += nameParser.parse(content.name, rawJson)
    }
    if (content.array_subscripts != null) {
      moOutput += arraySubscriptsParser.parse(content.array_subscripts, rawJson)
    }
    if (content.class_modification != null) {
      moOutput += classModificationParser.parse(content.class_modification, rawJson)
    }
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
