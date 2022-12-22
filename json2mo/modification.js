function parse (content, rawJson = false) {
  const classModificationParser = require('./classModification')
  const expressionParser = require('./expression')
  var moOutput = ''

  var haveClaMod = content.class_modification != null
  if (haveClaMod) {
    moOutput += classModificationParser.parse(content.class_modification, rawJson)
  }

  if (content.equal != null) {
    if (haveClaMod) { moOutput += '\t' }
    if (content.equal) {
      moOutput += '='
    }
  } else if (content.colon_equal != null) {
    if (haveClaMod) { moOutput += '\t' }
    if (content.colon_equal) {
      moOutput += ':='
    }
  }
  if (content.expression != null) {
    moOutput += expressionParser.parse(content.expression, rawJson)
  }
  return moOutput
}

module.exports = {parse}
