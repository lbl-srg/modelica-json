function parse (content, rawJson = false) {
  const logicalAndParser = require('./logicalAnd')

  const logicalOr = content.logical_or
  let moOutput = ''
  moOutput += logicalAndParser.parse(logicalOr[0].logical_and, rawJson)
  if (logicalOr.length > 1) {
    for (let i = 1; i < logicalOr.length; i++) {
      moOutput += ' or '
      moOutput += logicalAndParser.parse(logicalOr[i].logical_and, rawJson)
    }
  }
  return moOutput
}

module.exports = { parse }
