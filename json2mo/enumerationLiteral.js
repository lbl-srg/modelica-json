function parse (content, rawJson = false) {
  const util = require('util')
  const commentParser = require('./comment')

  var moOutput = ''

  if (content.identifier != null) {
    moOutput += util.format('%s ', content.identifier)
  }
  if (rawJson) {
    if (content.comment != null) {
      moOutput += commentParser.parse(content.comment)
    }
  } else {
    if (content.description != null) {
      moOutput += commentParser.parse(content.description)
    }
  }

  return moOutput
}

module.exports = {parse}
