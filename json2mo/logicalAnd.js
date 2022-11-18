function parse (content, rawJson = false) {
  const logicalFactorObjParser = require('./logicalFactorObj')

  var moOutput = ''
  moOutput += logicalFactorObjParser.parse(content[0], rawJson)
  if (content.length > 1) {
    for (var i = 1; i < content.length; i++) {
      moOutput += ' and '
      moOutput += logicalFactorObjParser.parse(content[i], rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
