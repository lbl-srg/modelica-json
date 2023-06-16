function parse (content, rawJson = false) {
  const namedArgumentParser = require('./namedArgument')

  let moOutput = ''

  if (rawJson) {
    if (content.named_argument != null) {
      moOutput += namedArgumentParser.parse(content.named_argument, rawJson)
    }
    if (content.named_arguments != null) {
      moOutput += ','
      moOutput += this.parse(content.named_arguments, rawJson)
    }
  }

  return moOutput
}

module.exports = { parse }
