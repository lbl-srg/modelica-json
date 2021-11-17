function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const statementParser = require('./statement')

  var moOutput = ''
  moOutput += 'while '
  if (content.condition != null) { // in simplified json
    moOutput += expressionParser.parse(content.condition, rawJson)
  }
  moOutput += 'loop \n'

  var loopStatements = content.loop_statements
  loopStatements.forEach(ele => {
    moOutput += statementParser.parse(ele, rawJson)
    moOutput += ';\n'
  })
  moOutput += 'end while'
  return moOutput
}

module.exports = {parse}
