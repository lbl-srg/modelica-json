function parse (content, rawJson) {
  const shortClassDefinitionParser = require('./shortClassDefinition')
  const componentClause1Parser = require('./componentClause1')
  const elementReplaceableParser = require('./elementReplaceable')

  var moOutput = ''
  moOutput += 'redeclare '

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
  if (content.element_replaceable != null) {
    moOutput += elementReplaceableParser.parse(content.element_replaceable, rawJson)
  } else {
    if (content.short_class_definition != null) {
      moOutput += shortClassDefinitionParser.parse(content.short_class_definition, rawJson)
    } else if (content.component_clause1 != null) {
      moOutput += componentClause1Parser.parse(content.component_clause1, rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
