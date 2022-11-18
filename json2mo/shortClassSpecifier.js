function parse (content, rawJson = false) {
  const util = require('util')
  const shortClassSpecifierValueParser = require('./shortClassSpecifierValue')

  var moOutput = ''
  var identifier = content.identifier

  if (identifier != null) {
    moOutput += util.format('%s=', identifier)
  }
  if (rawJson) {
    if (content.short_class_specifier_value != null) {
      moOutput += shortClassSpecifierValueParser.parse(content.short_class_specifier_value, rawJson)
    }
  } else {
    if (content.value != null) {
      moOutput += shortClassSpecifierValueParser.parse(content.value, rawJson)
    }
  }

  return moOutput
}

module.exports = {parse}
