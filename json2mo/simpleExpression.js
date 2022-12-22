function parse (content, rawJson = false) {
  const util = require('util')
  const functionCallParser = require('./functionCallObj')
  const forLoopParser = require('./forLoopObj')
  const logicalExpressionParser = require('./logicalExpression')
  const ifExpressionParser = require('./ifExpressionObj')

  var moOutput = ''
  if (content != null) {
    if (rawJson) {
      moOutput += util.format('%s', JSON.stringify(content))
    } else {
      if (content.function_call) {
        moOutput += functionCallParser.parse(content.function_call, rawJson)
      } else if (content.for_loop) {
        moOutput += forLoopParser.parse(content.for_loop, rawJson)
      } else if (content.logical_expression) {
        moOutput += logicalExpressionParser.parse(content.logical_expression, rawJson)
      } else if (content.if_expression) {
        moOutput += ifExpressionParser.parse(content.if_expression, rawJson)
      } else {
        moOutput += util.format('%s', content)
      }
    }
  }
  return moOutput
}

module.exports = {parse}
