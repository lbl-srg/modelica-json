function parse (content, rawJson = false) {
  const nameParser = require('./name')
  const namedArgumentsParser = require('./named_arguments')
  const namedArgumentParser = require('./namedArgument')
  const expressionParser = require('./expression')

  var moOutput = ''

  if (content.function_name != null) {
    moOutput += 'function '
    moOutput += nameParser.parse(content.function_name, rawJson)
    moOutput += '('

    if (rawJson) {
      if (content.named_arguments != null) {
        moOutput += namedArgumentsParser.parse(content.named_arguments, rawJson)
      }
    } else {
      var namedArguments = content.named_arguments
      if (namedArguments != null) {
        namedArguments.forEach(ele => {
          moOutput += namedArgumentParser.parse(ele, rawJson)
        })
      }
    }

    moOutput += ') '
  } else if (content.expression != null) {
    moOutput += expressionParser.parse(content.expression, rawJson)
  }

  return moOutput
}

module.exports = {parse}
