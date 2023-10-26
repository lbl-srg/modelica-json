function parse (content, rawJson = false) {
  const util = require('util')
  const classSpecifier = require('./classSpecifier')
  const encapsulated = content.encapsulated
  const classPrefixes = content.class_prefixes
  let moOutput = ''

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

module.exports = { parse }
