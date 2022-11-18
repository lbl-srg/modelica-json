function parse (content, rawJson = false) { 
  const logicalAndParser = require('./logicalAnd')

  var logicalOr = content.logical_or
  var moOutput = ''
  moOutput += logicalAndParser.parse(logicalOr[0].logical_and, rawJson)
  if (logicalOr.length > 1) {
    for (var i = 1; i < logicalOr.length; i++) {
      moOutput += ' or '
      moOutput += logicalAndParser.parse(logicalOr[i].logical_and, rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
