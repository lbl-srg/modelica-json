function parse (content, rawJson = false) {
  const util = require('util')
  const componentReferenceParser = require('./componentReference')
  const expressionListParser = require('./expressionList')

  var moOutput = ''

  if (content.component_reference != null) {
    moOutput += componentReferenceParser.parse(content.component_reference, rawJson)
    moOutput += '= '
  }
  if (content.identifier != null) {
    moOutput += util.format('%s (', content.identifier)
  }
  if (content.expression_list != null) {
    moOutput += expressionListParser.parse(content.expression_list, rawJson)
  }
  moOutput += ')\n'
  return moOutput
}

module.exports = {parse}
