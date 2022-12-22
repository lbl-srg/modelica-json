function parse (content, rawJson = false) {
  const classModificationParser = require('./classModification')

  var moOutput = ''
  moOutput += '\n\tannotation '
  if (rawJson) {
    if (content.class_modification != null) {
      moOutput += classModificationParser.parse(content.class_modification, rawJson)
    }
  } else {
    var classModification = content
    moOutput += classModificationParser.parse(classModification, rawJson)
  }
    // moOutput+="\n"
  return moOutput
}

module.exports = {parse}
