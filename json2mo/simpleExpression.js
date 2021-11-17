function parse (content, rawJson = false) {
  const util = require('util')
  var moOutput = ''
  if (content != null) {
    if (rawJson) {
      moOutput += util.format('%s', JSON.stringify(content))
    } else {
      moOutput += util.format('%s', content)
    }
  }
  return moOutput
}

module.exports = {parse}
