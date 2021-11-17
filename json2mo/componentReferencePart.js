function parse (content, rawJson = false) {
  const util = require('util')
  const arraySubscriptsParser = require('./arraySubscripts')

  var moOutput = ''

  if (rawJson) {
    if (content.dot_op != null) {
      if (content.dot_op) {
        moOutput += '.'
      }
    }
    if (content.identifier != null) {
      moOutput += util.format('%s', content.identifier)
    }
    if (content.array_subscripts != null) {
      moOutput += arraySubscriptsParser.parse(content.array_subscripts, rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
