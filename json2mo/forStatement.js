function parse (content, rawJson = false) {
  const forIndicesParser = require('./for_indices')
  const statementParser = require('./statement')

  let moOutput = ''
  moOutput += 'for '
  if (content.for_indices != null) {
    moOutput += forIndicesParser.parse(content.for_indices, rawJson)
  }
  moOutput += 'loop \n'

  const loopStatements = content.loop_statements
  loopStatements.forEach(ele => {
    moOutput += statementParser.parse(ele, rawJson)
    moOutput += ';\n'
  })
  moOutput += 'end for'
  return moOutput
}

module.exports = { parse }
