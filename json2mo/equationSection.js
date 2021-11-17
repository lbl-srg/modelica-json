function parse (content, rawJson = false) {
  const equationParser = require('./equation')

  var moOutput = ''
  if (content.initial != null) {
    if (content.initial) {
      moOutput += 'initial '
    }
  }
  moOutput += 'equation'
  var equations
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

module.exports = {parse}
