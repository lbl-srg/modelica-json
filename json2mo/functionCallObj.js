function parse (content, rawJson = false) {
  const util = require('util')
  const functionCallArgsObjParser = require('./functionCallArgsObj')

  let moOutput = ''
  if (content.name != null) {
    moOutput += util.format('%s', content.name)
  }
  if (content.arguments != null) {
    moOutput += '('
    moOutput += functionCallArgsObjParser.parse(content.arguments, rawJson)
    moOutput += ')'
  }
  return moOutput
}

module.exports = { parse }
