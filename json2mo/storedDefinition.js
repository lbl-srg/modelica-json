function parse (content, rawJson = false) {
  const util = require('util')
  const finalClassDefinitionParser = require('./finalClassDefinition')

  const within = content.within

  let moOutput = ''
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
    if (content.stored_class_definitions != null) {
      content.stored_class_definitions.forEach(ele => {
        moOutput += finalClassDefinitionParser.parse(ele, rawJson)
        moOutput += '\n'
      })
    }
  }
  return moOutput
}

module.exports = { parse }
