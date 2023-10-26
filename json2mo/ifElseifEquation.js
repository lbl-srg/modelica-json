function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const equationParser = require('./equation')

  let moOutput = ''

  if (content.condition != null) {
    moOutput += expressionParser.parse(content.condition, rawJson)
  }

  const thenEquations = content.then
  let thenOutput = ''
  if (thenEquations != null) {
    thenOutput = ''
    thenEquations.forEach(ele => {
      thenOutput += equationParser.parse(ele, rawJson)
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
