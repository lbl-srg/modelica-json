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
      // In the json output, lib/jsonquery.js wraps each equation of a branch
      // as {equation: ...} (see if_elseIfEquation in schema-modelica.json),
      // whereas the raw-json output and else_equation list them directly.
      const equ = (!rawJson && ele.equation != null) ? ele.equation : ele
      thenOutput += equationParser.parse(equ, rawJson)
      thenOutput += ';\n'
    })
  }
  // 'then' is required even if the branch has no equation or statement.
  moOutput += ' then \n'
  moOutput += thenOutput
  return moOutput
}

module.exports = { parse }
