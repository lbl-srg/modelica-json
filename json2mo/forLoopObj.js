function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const forIndiceObjParser = require('./forIndicesObj') 

  var moOutput = ''
  if (content != null) {
    moOutput += expressionParser.parse(content.expression, rawJson)
    moOutput += ' for '
    moOutput += forIndiceObjParser.parser(content[0].for_loop, rawJson)
  }
  return moOutput
}

module.exports = {parse}
