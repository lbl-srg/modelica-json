function parse (content, rawJson = false) {
  const longClassSpecifierParser = require('./longClassSpecifier')
  const shortClassSpecifierParser = require('./shortClassSpecifier')
  const derClassSpecifierParser = require('./derClassSpecifier')

  var longClassSpecifier = content.long_class_specifier
  var shortClassSpecifier = content.short_class_specifier
  var derClassSpecifier = content.der_class_specifier

  var moOutput = ''

  if (longClassSpecifier != null) {
    moOutput += longClassSpecifierParser.parse(longClassSpecifier, rawJson)
  }

  if (shortClassSpecifier != null) {
    moOutput += shortClassSpecifierParser.parse(shortClassSpecifier, rawJson)
  }

  if (derClassSpecifier != null) {
    moOutput += derClassSpecifierParser.parse(derClassSpecifier, rawJson)
  }

  return moOutput
}

module.exports = {parse}
