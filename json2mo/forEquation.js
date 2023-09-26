function parse (content, rawJson = false) {
  const forIndicesParser = require('./forIndices')
  const equationParser = require('./equation')

  let moOutput = ''
  moOutput += 'for '
  if (content.for_indices != null) {
    moOutput += forIndicesParser.parse(content.for_indices, rawJson)
  }

  moOutput += 'loop \n'

  const loopEquations = content.loop_equations
  loopEquations.forEach(ele => {
    moOutput += equationParser.parse(ele, rawJson)
    moOutput += ';\n'
  })
  moOutput += 'end for'
  return moOutput
}

module.exports = { parse }
