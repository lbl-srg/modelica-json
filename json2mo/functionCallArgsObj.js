function parse (content, rawJson = false) {
  const util = require('util')
  const expressionParser = require('./expression')
  const forIndiceObjParser = require('./forIndicesObj')

  let moOutput = ''
  if (content[0].expression != null) {
    moOutput += expressionParser.parse(content[0].expressoin, rawJson)
    moOutput += ' for '
    moOutput += forIndiceObjParser.parse(content[0].for_loop, rawJson)
  } else {
    if (content.length > 1) {
      moOutput += util.format('%s', content[0].name)
      moOutput += ','
      moOutput += util.format('%s', content[1].name)
    } else {
      moOutput += util.format('%s', content[0].name)
    }
  }
  return moOutput
}

module.exports = { parse }
