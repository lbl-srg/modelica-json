function parse (content, rawJson = false) {
  const componentReferenceParser = require('./componentReference')
  const outputExpressionListParser = require('./outputExpressionList')
  const functionCallArgsParser = require('./functionCallArgs')

  let moOutput = ''
  moOutput += '('
  if (content.output_expression_list != null) {
    moOutput += outputExpressionListParser.parse(content.output_expression_list, rawJson)
  }
  moOutput += ')'
  moOutput += ':='
  if (content.function_name != null) {
    moOutput += componentReferenceParser.parse(content.function_name, rawJson)
  }
  if (content.function_call_args != null) {
    moOutput += functionCallArgsParser.parse(content.function_call_args, rawJson)
  }
  return moOutput
}

module.exports = { parse }
