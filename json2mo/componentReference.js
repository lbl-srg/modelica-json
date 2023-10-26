function parse (content, rawJson = false) {
  const util = require('util')
  const arraySubscriptsParser = require('./arraySubscripts')
  const componentReferencePartParser = require('./componentReferencePart')

  let moOutput = ''
  let componentReferenceParts
  if (rawJson) {
    componentReferenceParts = content.component_reference_parts
    if (componentReferenceParts != null) {
      componentReferenceParts.forEach(ele => {
        moOutput += componentReferencePartParser.parse(ele, rawJson)
      })
    }
  } else {
    componentReferenceParts = content
    componentReferenceParts.forEach(ele => {
      if (ele.dot_op != null) {
        if (ele.dot_op) {
          moOutput += '.'
        }
      }
      if (ele.identifier != null) {
        moOutput += util.format('%s', ele.identifier)
      }
      if (ele.array_subscripts != null) {
        moOutput += arraySubscriptsParser.parse(ele.array_subscripts, rawJson)
      }
    })
  }
  return moOutput
}

module.exports = { parse }
