function parse (content, rawJson = false) {
  const util = require('util')
  const nameParser = require('./name')

  let moOutput = ''
  if (rawJson) {
    if (content.name != null) {
      moOutput += nameParser.parse(content.name, rawJson)
    }
  } else {
    const name = content
    moOutput += util.format('%s ', name)
  }

  return moOutput
}

module.exports = { parse }
