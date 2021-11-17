function parse (content, rawJson = false) {
  const util = require('util')
  const derClassSpecifierValueParser = require('./derClassSpecifierValue')

  var moOutput = ''
  var identifier = content.identifier

  if (identifier != null) {
    moOutput += util.format('%s= ', identifier)
  }

  if (rawJson) {
    if (content.der_class_specifier_value != null) {
      moOutput += derClassSpecifierValueParser.parse(content.der_class_specifier_value, rawJson)
    }
  } else {
    if (content.value != null) {
      moOutput += derClassSpecifierValueParser.parse(content.value, rawJson)
    }
  }

  return moOutput
}

module.exports = {parse}
