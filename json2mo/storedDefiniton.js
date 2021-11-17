function parse (content, rawJson = false) {
  const util = require('util')
  const finalClassDefinitionParser = require('./finalClassDefinition')

  var within = content.within

  var moOutput = ''
  if (within != null) {
    moOutput += util.format('within %s;\n', within)
  }

  if (rawJson) {
    if (content.final_class_definitions != null) {
      content.final_class_definitions.forEach(ele => {
        moOutput += finalClassDefinitionParser.parse(ele, rawJson)
        moOutput += '\n'
      })
    }
  } else {
    if (content.class_definition != null) {
      content.class_definition.forEach(ele => {
        moOutput += finalClassDefinitionParser.parse(ele, rawJson)
        moOutput += '\n'
      })
    }
  }
  return moOutput
}

module.exports = {parse}
