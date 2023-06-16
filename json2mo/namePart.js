function parse (content, rawJson = false) {
  let moOutput = ''
  if (rawJson) {
    if (content.dot_op != null) {
      if (content.dot_op) {
        moOutput += '.'
      }
    }

    if (content.identifier != null) {
      moOutput += content.identifier
    }
  }
  return moOutput
}

module.exports = { parse }
