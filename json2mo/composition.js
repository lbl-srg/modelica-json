function parse (content, rawJson = false) {
  const elementListParser = require('./elementList')
  const elementSectionParser = require('./elementSection')
  const externalCompositionParser = require('./externalComposition')
  const annotationParser = require('./annotation')

  var moOutput = ''
  if (content.element_list != null) {
    moOutput += elementListParser.parse(content.element_list, rawJson)
  }
  if (content.element_sections != null) {
    var elementSections = content.element_sections
    elementSections.forEach(ele => {
      moOutput += elementSectionParser.parse(ele, rawJson)
    })
  }
  if (content.external_composition != null) {
    moOutput += externalCompositionParser.parse(content.external_composition, rawJson)
  }
  if (content.annotation != null) {
    moOutput += annotationParser.parse(content.annotation, rawJson)
    moOutput += ';\n'
  }
  return moOutput
}

module.exports = {parse}
