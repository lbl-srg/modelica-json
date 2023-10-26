function parse (content, rawJson = false) {
  const elementListParser = require('./elementList')
  const equationSectionParser = require('./equationSection')
  const algorithmSectionParser = require('./algorithmSection')

  let moOutput = ''

  if (content.public_element_list != null) {
    moOutput += 'public\n'
    moOutput += elementListParser.parse(content.public_element_list, rawJson)
  } else if (content.protected_element_list != null) {
    moOutput += 'protected\n'
    moOutput += elementListParser.parse(content.protected_element_list, rawJson)
  } else if (content.equation_section != null) {
    moOutput += equationSectionParser.parse(content.equation_section, rawJson)
  } else if (content.algorithm_section != null) {
    moOutput += algorithmSectionParser.parse(content.algorithm_section, rawJson)
  }
  return moOutput
}

module.exports = { parse }
