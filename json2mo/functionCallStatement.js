function parse (content, rawJson = false) {
  const componentReferenceParser = require('./componentReference')
  const functionCallArgsParser = require('./functionCallArgs')

  var moOutput = ''
  if (content.function_name != null) {
    moOutput += componentReferenceParser.parse(content.function_name, rawJson)
  }
  if (content.function_call_args != null) {
    moOutput += functionCallArgsParser.parse(content.function_call_args, rawJson)
  }
  return moOutput
}

module.exports = {parse}
