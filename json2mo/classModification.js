function parse (content, rawJson = false) {
  const argumentListParser = require('./argumentList')
  const argumentParser = require('./argument')

  let moOutput = ''
  if (rawJson) {
    moOutput += '(\n\t'
    if (content.argument_list != null) {
      moOutput += argumentListParser.parse(content.argument_list, rawJson)
    }
    moOutput += ')\n\t'
  } else {
    const argumentList = content
    moOutput += '(\n\t'

    argumentList.forEach(argument => {
      moOutput += argumentParser.parse(argument, rawJson)
      moOutput += ',\n\t'
    })

    moOutput = moOutput.slice(0, moOutput.lastIndexOf(','))
    moOutput += ')'
  }
  return moOutput
}

module.exports = { parse }
