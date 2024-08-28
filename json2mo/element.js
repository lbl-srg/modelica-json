function parse (content, rawJson = false) {
  const classDefinitionParser = require('./classDefinition')
  const importClauseParser = require('./importClause')
  const extendsClauseParser = require('./extendsClause')
  const componentClauseParser = require('./componentClause')
  const constrainingClauseParser = require('./constrainingClause')
  const commentParser = require('./comment')

  let moOutput = ''
  if (content.import_clause != null) {
    moOutput += importClauseParser.parse(content.import_clause, rawJson)
    moOutput += ';\n'
  } else if (content.extends_clause != null) {
    moOutput += extendsClauseParser.parse(content.extends_clause, rawJson)
    moOutput += ';\n'
  } else {
    if (content.redeclare != null) {
      if (content.redeclare) {
        moOutput += 'redeclare '
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
    if (content.inner != null) {
      if (content.inner) {
        moOutput += 'inner '
      }
    }
    if (content.outer != null) {
      if (content.outer) {
        moOutput += 'outer '
      }
    }
    if (content.replaceable != null) {
      if (content.replaceable) {
        moOutput += 'replaceable '
        if (content.element_class_definition != null) {
          moOutput += classDefinitionParser.parse(content.element_class_definition, rawJson)
        } else if (content.component_clause != null) {
          moOutput += componentClauseParser.parse(content.component_clause, rawJson)
        }

        if (content.constraining_clause != null) {
          moOutput += '\n'
          moOutput += constrainingClauseParser.parse(content.constraining_clause, rawJson)
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
        moOutput += ';\n'
      } else {
        if (content.element_class_definition != null) {
          moOutput += classDefinitionParser.parse(content.element_class_definition, rawJson)
        } else if (content.component_clause != null) {
          moOutput += componentClauseParser.parse(content.component_clause, rawJson)
        }
      }
    } else {
      if (content.element_class_definition != null) {
        moOutput += classDefinitionParser.parse(content.element_class_definition, rawJson)
      } else if (content.component_clause != null) {
        moOutput += componentClauseParser.parse(content.component_clause, rawJson)
      }
      moOutput += ';\n'
    }
  }
  return moOutput
}
module.exports = { parse }
