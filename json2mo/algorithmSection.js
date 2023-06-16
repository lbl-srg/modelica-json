function parse (content, rawJson = false) {
  const statementParser = require('./statement')

  let moOutput = ''
  if (content.initial != null) {
    if (content.initial) {
      moOutput += 'initial '
    }
  }
  moOutput += 'algorithm'
  let statements = null
  if (rawJson) {
    statements = content.statements
  } else {
    statements = content.statement
  }

  if (statements != null) {
    statements.forEach(statement => {
      moOutput += statementParser.parse(statement, rawJson)
      moOutput += ';'
    })
  }
  return moOutput
}

module.exports = { parse }
