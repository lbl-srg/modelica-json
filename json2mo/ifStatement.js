function parse (content, rawJson = false) {
  const ifElseifStatementParser = require('./ifElseifStatement')
  const statementParser = require('./statement')

  let moOutput = ''
  const ifElseifs = content.if_elseif
  if (ifElseifs != null) {
    ifElseifs.forEach(ele => {
      moOutput += 'elseif '
      moOutput += ifElseifStatementParser.parse(ele, rawJson)
    })
  }
  moOutput = moOutput.slice(4, moOutput.length) // to remove 1st else of elseif so that we get "if"

  const elseStatements = content.else_statement
  if (elseStatements != null) {
    let elseOutput = ''
    elseStatements.forEach(ele => {
      elseOutput += statementParser.parse(ele, rawJson)
      elseOutput += ';\n'
    })
    if (elseOutput !== '') {
      moOutput += 'else \n'
      moOutput += elseOutput
    }
  }
  moOutput += 'end if\n'
  return moOutput
}

module.exports = { parse }
