function parse (content, rawJson = false) {
  const util = require('util')
  const nameParser = require('./name')
  const commentParser = require('./comment')

  let moOutput = 'der('
  if (content.type_specifier != null) {
    moOutput += nameParser.parse(content.type_specifier, rawJson)
  }
  let identifiers = null
  if (rawJson) {
    identifiers = content.identifiers
  } else {
    identifiers = content.identifier
  }
  if (identifiers != null) {
    identifiers.forEach(identifier => {
      moOutput += util.format('%s, ', identifier)
    })
    moOutput = moOutput.slice(0, -2)
    moOutput += ') '
  }
  if (rawJson) {
    if (content.comment != null) {
      moOutput += commentParser.parse(content.comment, rawJson)
    }
  } else {
    if (content.description != null) {
      moOutput += commentParser.parse(content.description, rawJson)
    }
  }

  return moOutput
}

module.exports = { parse }
