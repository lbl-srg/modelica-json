function parse (content, rawJson = false) {
  const namedArgumentsParser = require('./namedArguments')
  const namedArgumentParser = require('./namedArgument')
  const functionArgumentsParser = require('./functionArguments')
  const functionArgumentParser = require('./functionArgument')
  const forIndicesParser = require('./forIndices')

  let moOutput = ''

  if (rawJson) {
    if (content.named_arguments != null) {
      moOutput += namedArgumentsParser.parse(content.named_arguments, rawJson)
    } else {
      if (content.function_argument != null) {
        moOutput += functionArgumentParser.parse(content.function_argument, rawJson)
      }

      if (content.function_arguments != null) {
        moOutput += ','
        moOutput += functionArgumentsParser.parse(content.function_arguments, rawJson)
      } else if (content.for_indices != null) {
        moOutput += 'for '
        moOutput += forIndicesParser.parse(content.for_indices, rawJson)
      }
    }
  } else {
    const namedArguments = content.named_arguments // only in simplified-json

    if (namedArguments != null) {
      namedArguments.forEach(ele => {
        moOutput += namedArgumentParser.parse(ele, rawJson)
        moOutput += ', '
      })
      moOutput = moOutput.slice(0, -1)
    } else {
      if (content.function_argument != null) {
        moOutput += functionArgumentParser.parse(content.function_argument, rawJson)

        if (content.function_arguments != null) {
          moOutput += ', '
          moOutput += this.parse(content.function_arguments, rawJson)
        } else if (content.for_indices != null) {
          moOutput += ' for '
          moOutput += forIndicesParser.parse(content.for_indices, rawJson)
        }
      }
    }
  }
  return moOutput
}

module.exports = { parse }
