function parse (content, rawJson = false) {
  const util = require('util')
  const expressionParser = require('./expression')
  const forIndexParser = require('./forIndex') // only for raw-json

  let moOutput = ''
  let indices
  if (rawJson) {
    indices = content.indices
    if (indices != null) {
      indices.forEach(ele => {
        moOutput += forIndexParser.parse(ele, rawJson)
        moOutput += ','
      })
      moOutput = moOutput.slice(0, -1)
    }
  } else {
    indices = content
    if (indices != null) {
      indices.forEach(index => {
        if (index.identifier != null) {
          moOutput += util.format('%s ', index.identifier)
        }
        if (index.expression != null) {
          moOutput += 'in '
          moOutput += expressionParser.parse(index.expression, rawJson)
        }
        moOutput += ','
      })
      moOutput = moOutput.slice(0, -1)
    }
  }
  return moOutput
}

module.exports = { parse }
