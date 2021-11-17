function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const statementParser = require('./statement')

  var moOutput = ''

  if (content.condition != null) {
    moOutput += expressionParser.parse(content.condition, rawJson)
  }

  var thenStatements = content.then
  var thenOutput = ''
  if (thenStatements != null) {
    thenOutput = ''
    thenStatements.forEach(ele => {
      thenOutput += statementParser.parser(ele, rawJson)
      thenOutput += ';\n'
    })
    if (thenOutput !== '') {
      moOutput += ' then \n'
      moOutput += thenOutput
    }
  }
  return moOutput
}

module.exports = {parse}
