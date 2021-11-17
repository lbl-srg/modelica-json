function parse (content, rawJson = false) {
  const argumentListParser = require('./argumentList')
  const argumentParser = require('./argument')

  var moOutput = ''
  if (rawJson) {
    moOutput += '('
    if (content.argument_list != null) {
      moOutput += argumentListParser.parse(content.argument_list, rawJson)
    }
    moOutput += ')'
  } else {
    var argumentList = content
    moOutput += '('

    argumentList.forEach(argument => {
      moOutput += argumentParser.parse(argument, rawJson)
      moOutput += ', '
    })

    moOutput = moOutput.slice(0, -2)
    moOutput += ')'
  }
  return moOutput
}

module.exports = {parse}
