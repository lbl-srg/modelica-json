function parse (content, rawJson = false) {
  const util = require('util')
  const typeSpecifierParser = require('./typeSpecifier')
  const componentDeclaration1Parser = require('./componentDeclaration1')

  let moOutput = ''
  if (rawJson) {
    if (content.type_prefix != null) {
      moOutput += util.format('%s ', content.type_prefix)
    }
    if (content.type_specifier != null) {
      moOutput += typeSpecifierParser.parse(content.type_specifier, rawJson)
    }
    if (content.component_declaration1 != null) {
      moOutput += componentDeclaration1Parser.parse(content.component_declaration1, rawJson)
    }
  } else {
    if (content.type_prefix != null) {
      moOutput += util.format('%s ', content.type_prefix)
    }
    if (content.type_specifier != null) {
      moOutput += util.format('%s ', content.type_specifier)
    }
    if (content.component_declaration1 != null) {
      moOutput += componentDeclaration1Parser.parse(content.component_declaration1, rawJson)
    }
  }

  return moOutput
}

module.exports = { parse }
