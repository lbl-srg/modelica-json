function parse (content, rawJson = false) {
  const util = require('util')
  const annotationParser = require('./annotation')

  var moOutput = ''
  if (rawJson) {
    if (content.string_comment != null) {
      moOutput += util.format('\n"\t%s"', content.string_comment)
    }
    if (content.annotation != null) {
      moOutput += annotationParser.parse(content.annotation, rawJson)
    }
  } else {
    if (content.description_string != null) {
      moOutput += util.format('\n\t"%s"', content.description_string)
    }
    if (content.annotation != null) {
      moOutput += annotationParser.parse(content.annotation, rawJson)
    }
  }

  return moOutput
}

module.exports = {parse}
