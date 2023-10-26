function parse (content, rawJson = false) {
  const namedArgumentParser = require('./namedArgument')
  const functionArgumentParser = require('./functionArgument')
  const functionArgumentsParser = require('./functionArguments')
  const forIndicesParser = require('./forIndices')
  let moOutput = ''
  moOutput += '('

  if (rawJson) {
    if (content.function_arguments != null) {
      moOutput += functionArgumentsParser.parse(content.function_arguments, rawJson)
    }
  } else {
    const namedArguments = content.named_arguments // only in simplified-json

    if (namedArguments != null) {
      namedArguments.forEach(ele => {
        moOutput += namedArgumentParser.parse(ele, rawJson)
        moOutput += ','
      })
      moOutput = moOutput.slice(0, -1)
    } else {
      if (content.function_argument != null) {
        moOutput += functionArgumentParser.parse(content.function_argument, rawJson)

        if (content.function_arguments != null) {
          moOutput += ', '
          moOutput += functionArgumentsParser.parse(content.function_arguments, rawJson)
        } else if (content.for_indices != null) {
          moOutput += ' for '
          moOutput += forIndicesParser.parse(content.for_indices, rawJson)
        }
      }
    }
  }

  moOutput += ')'
  return moOutput
}

module.exports = { parse }
