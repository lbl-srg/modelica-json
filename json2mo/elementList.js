function parse (content, rawJson = false) {
  const elementParser = require('./element')

  var moOutput = ''
  var elements
  if (rawJson) {
    elements = content.elements
    if (elements != null) {
      elements.forEach(element => {
        moOutput += elementParser.parse(element, rawJson)
      })
    }
  } else {
    elements = content
    if (elements != null) {
      elements.forEach(element => {
        moOutput += elementParser.parse(element, rawJson)
      })
    }
  }

  return moOutput
}

module.exports = {parse}
