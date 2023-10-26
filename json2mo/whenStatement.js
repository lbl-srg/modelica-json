function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const statementParser = require('./statement')

  let moOutput = ''
  let whenElsewhens = null
  if (rawJson) {
    whenElsewhens = content.when_elsewhen
  } else {
    whenElsewhens = content
  }

  if (whenElsewhens != null) {
    whenElsewhens.forEach(ele => {
      moOutput += 'elsewhen '
      if (ele.condition != null) {
        moOutput += expressionParser.parse(ele.condition, rawJson)
      }
      moOutput += '\n'
      const thenStatements = ele.then
      let thenOutput = ''
      if (thenStatements != null) {
        thenStatements.forEach(thenSta => {
          thenOutput += statementParser.parse(thenSta, rawJson)
          thenOutput += ';\n'
        })
      }

      if (thenOutput !== '') {
        moOutput += 'then \n'
        moOutput += thenOutput
      }
    })
    moOutput = moOutput.slice(4, moOutput.length)
  }
  moOutput += 'end when \n'
  return moOutput
}

module.exports = { parse }
