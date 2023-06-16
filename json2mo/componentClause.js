function parse (content, rawJson = false) {
  const typeSpecifierParser = require('./typeSpecifier')
  const arraySubscriptsParser = require('./arraySubscripts')
  const componentListParser = require('./componentList')
  const util = require('util')

  let moOutput = ''

  if (content.type_prefix != null) {
    moOutput += util.format('%s ', content.type_prefix)
  }
  if (rawJson) {
    if (content.type_specifier != null) {
      moOutput += typeSpecifierParser.parse(content.type_specifier, rawJson)
    }
  } else {
    if (content.type_specifier != null) {
      moOutput += util.format('%s ', content.type_specifier)
    }
  }

  if (content.array_subscripts != null) {
    moOutput += arraySubscriptsParser.parse(content.array_subscripts, rawJson)
  }
  if (content.component_list != null) {
    moOutput += componentListParser.parse(content.component_list, rawJson)
  }
  return moOutput
}

module.exports = { parse }
