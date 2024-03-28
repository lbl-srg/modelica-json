function parse (content, rawJson = false) {
  const argumentParser = require('./argument')
  let moOutput = ''
  if (rawJson) {
    const argumentStr = content.arguments

    if (argumentStr != null) {
      argumentStr.forEach(argument => {
        moOutput += argumentParser.parse(argument, rawJson)
        moOutput += ', '
      })
      moOutput = moOutput.slice(0, -2)
    }
  }
  return moOutput
}

module.exports = { parse }
