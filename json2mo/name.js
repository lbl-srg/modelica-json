function parse (content, rawJson = false) {
  const util = require('util')
  const namePartParser = require('./namePart')

  var moOutput = ''
  if (rawJson) {
    var nameParts = content.name_parts
    if (nameParts != null) {
      nameParts.forEach(ele => {
        moOutput += namePartParser.parse(ele, rawJson)
      })
    }
    moOutput += ' '
  } else {
    moOutput += util.format('%s ', content)
  }
  return moOutput
}

module.exports = {parse}
