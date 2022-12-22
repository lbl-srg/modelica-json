function parse (content, rawJson = false) {
  const util = require('util')

  var moOutput = ''
  var identifierList = content.identifier_list
  if (identifierList != null) {
    identifierList.forEach(identifier => {
      moOutput += util.format('%s, ', identifier)
    })
  }
  moOutput = moOutput.slice(0, -2)
  return moOutput
}

module.exports = {parse}
