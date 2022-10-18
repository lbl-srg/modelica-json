function parse (content, rawJson = false) { 
  const logicalAndParser = require('./logicalAnd')

  var logicalOr = content.logical_or
  var moOutput = ''
  if (logicalOr.length > 1) {
    moOutput += logicalAndParser.parser(logicalOr[0].logical_and, rawJson)
    for (var i = 1; i < logicalOr.length; i++) {
      moOutput += ' or '
      moOutput += logicalAndParser.parser(logicalOr[i].logical_and, rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
