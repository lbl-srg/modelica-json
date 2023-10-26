function parse (content, rawJson = false) {
  const nameParser = require('./name')
  const classModificationParser = require('./classModification')
  const annotationParser = require('./annotation')

  let moOutput = ''
  moOutput += 'extends '

  if (content.name != null) {
    moOutput += nameParser.parse(content.name, rawJson)
  }
  if (content.class_modification != null) {
    moOutput += classModificationParser.parse(content.class_modification, rawJson)
  }
  if (content.annotation != null) {
    moOutput += annotationParser.parse(content.annotation, rawJson)
  }
  return moOutput
}

module.exports = { parse }
