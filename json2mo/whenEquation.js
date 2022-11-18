function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const equationParser = require('./equation')

  var moOutput = ''
  var whenElsewhens = null
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
      var thenEquations = ele.then
      var thenOutput = ''
      if (thenEquations != null) {
        thenEquations.forEach(thenEqu => {
          thenOutput += equationParser.parse(thenEqu, rawJson)
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

module.exports = {parse}
