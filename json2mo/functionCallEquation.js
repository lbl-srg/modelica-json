function parse (content, rawJson = false) {
  const nameParser = require('./name')
  const functionCallArgsParser = require('./functionCallArgs')

  let moOutput = ''

  if (content.function_name != null) {
    moOutput += nameParser.parse(content.function_name, rawJson)
  }

  if (content.function_call_args != null) {
    moOutput += functionCallArgsParser.parse(content.function_call_args, rawJson)
  }
  return moOutput
}

module.exports = { parse }
