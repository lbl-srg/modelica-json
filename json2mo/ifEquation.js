function parse (content, rawJson = false) {
  const ifElseifEquationParser = require('./ifElseifEquation')
  const equationParser = require('./equation')

  var moOutput = ''
  var ifElseifs = content.if_elseif
  if (ifElseifs != null) {
    ifElseifs.forEach(ele => {
      moOutput += 'elseif '
      moOutput += ifElseifEquationParser.parse(ele, rawJson)
    })
  }
  moOutput = moOutput.slice(4, moOutput.length) // to remove 1st else of elseif so that we get "if"

  var elseEquations = content.else_equation
  if (elseEquations != null) {
    var elseOutput = ''
    elseEquations.forEach(ele => {
      elseOutput += equationParser.parser(ele, rawJson)
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

module.exports = {parse}
