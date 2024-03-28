function parse (content, rawJson = false) {
  const util = require('util')
  const nameParser = require('./name')
  const modificationParser = require('./modification')
  const graphicParser = require('./graphic')
  const graPri = require('../lib/graphicalPrimitives.js')

  // Get all the keys in the json object. It may be graphical primitive.
  const keys = Object.keys(content)
  let isGraPri = false
  // check if it is a graphical primitive
  isGraPri = keys.some(function (ele) {
    return graPri.isGraphicAnnotation(ele)
  })

  let moOutput = ''
  if (isGraPri) {
    moOutput += graphicParser.parse(content, rawJson)
  } else {
    if (content.name != null) {
      moOutput += nameParser.parse(content.name, rawJson)
      moOutput = moOutput.slice(0, -1)
    }
    if (content.modification != null) {
      moOutput += modificationParser.parse(content.modification, rawJson)
    }
    if (content.description_string != null) {
      moOutput += util.format(' "%s" ', content.description_string)
    }
  }
  return moOutput
}

module.exports = { parse }
