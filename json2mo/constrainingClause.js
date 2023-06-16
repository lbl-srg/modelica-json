function parse (content, rawJson = false) {
  const nameParser = require('./name')
  const classModificationParser = require('./classModification')

  let moOutput = ''
  moOutput += 'constrainedby '

  if (content.name != null) {
    moOutput += nameParser.parse(content.name, rawJson)
  }

  if (content.class_modification != null) {
    moOutput += classModificationParser.parse(content.class_modification, rawJson)
  }
  return moOutput
}
module.exports = { parse }
