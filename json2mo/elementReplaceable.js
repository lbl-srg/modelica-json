function parse (content, rawJson = false) {
  const shortClassDefinitionParser = require('./shortClassDefinition')
  const componentClause1Parser = require('./componentClause1')
  const constrainingClauseParser = require('./constrainingClause')

  let moOutput = ''
  moOutput += 'replaceable '
  if (content.short_class_definition != null) {
    moOutput += shortClassDefinitionParser.parse(content.short_class_definition, rawJson)
  } else if (content.component_clause1 != null) {
    moOutput += componentClause1Parser.parse(content.component_clause1, rawJson)
  }
  if (content.constraining_clause != null) {
    moOutput += constrainingClauseParser.parse(content.constraining_clause, rawJson)
  }
  return moOutput
}

module.exports = { parse }
