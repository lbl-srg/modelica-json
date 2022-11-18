function parse (content, rawJson = false) {
  const util = require('util')
  const shortClassSpecifierParser = require('./shortClassSpecifier')

  var moOutput = ''
  if (content.class_prefixes != null) {
    moOutput += util.format('%s ', content.class_prefixes)
  }
  if (content.short_class_specifier != null) {
    moOutput += shortClassSpecifierParser.parse(content.short_class_specifier, rawJson)
  }
  return moOutput
}

module.exports = {parse}
