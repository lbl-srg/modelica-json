function parse (content, rawJson = false, singleLine = false) {
  const util = require('util')
  const arraySubscriptsParser = require('./arraySubscripts')
  const modificationParser = require('./modification')

  let moOutput = ''
  if (content.identifier != null) {
    moOutput += util.format('%s', content.identifier)
  }
  if (content.array_subscripts != null) {
    moOutput += arraySubscriptsParser.parse(content.array_subscripts, rawJson)
  }
  if (content.modification != null) {
    moOutput += modificationParser.parse(content.modification, rawJson, singleLine)
  }
  return moOutput
}

module.exports = { parse }
