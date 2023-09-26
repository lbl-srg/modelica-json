function parse (content, rawJson = false) {
  const util = require('util')
  let moOutput = ''
  if (rawJson) {
    if (content.type_prefix != null) {
      moOutput += util.format('%s ', content.type_prefix)
    }
  } else {
    const basePrefix = content
    if (basePrefix != null) {
      moOutput += util.format('%s ', basePrefix)
    }
  }

  return moOutput
}

module.exports = { parse }
