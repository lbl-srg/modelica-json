function parse (content, rawJson = false) {
  const enumerationLiteralParser = require('./enumerationLiteral')

  var moOutput = ''
  var enumerationLiterals
  if (rawJson) {
    enumerationLiterals = content.enumeration_literal
  } else {
    enumerationLiterals = content
  }

  if (enumerationLiterals != null) {
    enumerationLiterals.forEach(ele => {
      moOutput += enumerationLiteralParser.parse(ele, rawJson)
      moOutput += ', '
    })
  }
  moOutput = moOutput.slice(0, -2)
  return moOutput
}

module.exports = {parse}
