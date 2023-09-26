function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const statementParser = require('./statement')

  let moOutput = ''

  if (content.condition != null) {
    moOutput += expressionParser.parse(content.condition, rawJson)
  }

  const thenStatements = content.then
  let thenOutput = ''
  if (thenStatements != null) {
    thenOutput = ''
    thenStatements.forEach(ele => {
      thenOutput += statementParser.parse(ele, rawJson)
      thenOutput += ';\n'
    })
    if (thenOutput !== '') {
      moOutput += ' then \n'
      moOutput += thenOutput
    }
  }
  return moOutput
}

module.exports = { parse }
