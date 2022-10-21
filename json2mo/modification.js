function parse (content, rawJson = false) {
  const classModificationParser = require('./classModification')
  const expressionParser = require('./expression')
  var moOutput = ''

  var have_claMod = content.class_modification != null
  if (have_claMod) {
    moOutput += classModificationParser.parse(content.class_modification, rawJson)
  }

  if (content.equal != null) {
    if (have_claMod) { moOutput += '\t' }
    if (content.equal) {
      moOutput += '='
    }
  } else if (content.colon_equal != null) {
    if (have_claMod) { moOutput += '\t' }
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
