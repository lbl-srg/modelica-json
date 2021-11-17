function parse (content, rawJson = false) {
  const util = require('util')
  const classSpecifier = require('./classSpecifier')
  var encapsulated = content.encapsulated
  var classPrefixes = content.class_prefixes
  var moOutput = ''

  if (encapsulated != null) {
    if (encapsulated) {
      moOutput = 'encapsulated '
    }
  }

  if (classPrefixes != null) {
    moOutput += util.format('%s ', classPrefixes)
  }
  moOutput += classSpecifier.parse(content.class_specifier, rawJson)
  return moOutput
}

module.exports = {parse}
