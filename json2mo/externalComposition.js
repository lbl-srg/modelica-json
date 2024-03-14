function parse (content, rawJson = false) {
  const util = require('util')
  const externalFunctionCallParser = require('./externalFunctionCall')
  const annotationParser = require('./annotation')

  let moOutput = ''
  moOutput += 'external '
  if (content.language_specification != null) {
    moOutput += util.format('%s ', content.language_specification)
  }
  if (content.external_function_call != null) {
    moOutput += externalFunctionCallParser.parse(content.external_function_call, rawJson)
  }
  if (content.external_annotation != null) {
    moOutput += annotationParser.parse(content.external_annotation, rawJson)
  }
  moOutput += ';\n'
  return moOutput
}

module.exports = { parse }
