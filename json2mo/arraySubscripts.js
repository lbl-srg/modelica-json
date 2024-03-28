function parse (content, rawJson = false) {
  const expressionParser = require('./expression')
  const subscriptParser = require('./subscript')

  let moOutput = ''

  if (rawJson) {
    moOutput += '['
    const subscripts = content.subscripts
    if (subscripts != null) {
      subscripts.forEach(subscript => {
        moOutput += subscriptParser.parse(subscript, rawJson)
        moOutput += ', '
      })
      moOutput = moOutput.slice(0, -2)
    }
    moOutput += '] '
  } else {
    const arraySubscripts = content
    moOutput += '['

    if (arraySubscripts != null) {
      arraySubscripts.forEach(ele => {
        if (ele.colon_op != null) {
          if (ele.colon_op) {
            moOutput = moOutput.slice(0, -2)
            moOutput += ': '
          }
        } else if (ele.expression != null) {
          moOutput += expressionParser.parse(ele.expression, rawJson)
          moOutput += ', '
        }
      })
      moOutput = moOutput.slice(0, -2)
    }
    moOutput += '] '
  }
  return moOutput
}

module.exports = { parse }
