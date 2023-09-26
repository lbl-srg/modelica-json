function parse (content, rawJson = false) {
  const equationParser = require('./equation')

  let moOutput = ''
  if (content.initial != null) {
    if (content.initial) {
      moOutput += 'initial '
    }
  }
  moOutput += 'equation'
  let equations
  if (rawJson) {
    equations = content.equations
  } else {
    equations = content.equation
  }
  if (equations != null) {
    equations.forEach(equation => {
      moOutput += equationParser.parse(equation, rawJson)
      moOutput += ';'
    })
  }
  return moOutput
}

module.exports = { parse }
