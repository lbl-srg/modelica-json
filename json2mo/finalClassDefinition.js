function parse (content, rawJson = false) {
  const classDefinitionParser = require('./classDefinition')

  var moOutput = ''
  var isFinal = false

  if (rawJson) {
    isFinal = content.is_final
  } else {
    isFinal = content.final
  }
  if (isFinal != null) {
    if (isFinal) {
      moOutput += 'final '
    }
  }

  if (rawJson) {
    if (content.class_definition != null) {
      moOutput += classDefinitionParser.parse(content.class_definition, rawJson)
    }
  } else {
    var classDefinition = content
    moOutput += classDefinitionParser.parse(classDefinition, rawJson)
  }

  return moOutput
}

module.exports = {parse}
