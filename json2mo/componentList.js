function parse (content, rawJson = false) {
  const componentDeclarationParser = require('./componentDeclaration')
  const declarationParser = require('./declaration')
  const conditionAttributeParser = require('./conditionAttribute')
  const commentParser = require('./comment')

  var moOutput = ''
  var componentDeclarationList
  if (rawJson) {
    componentDeclarationList = content.component_declaration_list

    componentDeclarationList.forEach(ele => {
      moOutput += componentDeclarationParser.parse(ele, rawJson)
    })
  } else {
    componentDeclarationList = content
    componentDeclarationList.forEach(ele => {
      if (ele.declaration != null) {
        moOutput += declarationParser.parse(ele.declaration, rawJson)
      }
      if (ele.condition_attribute != null) {
        moOutput += conditionAttributeParser.parse(ele.condition_attribute, rawJson)
      }
      if (ele.description != null) {
        moOutput += commentParser.parse(ele.description, rawJson)
      }
    })
  }

  return moOutput
}

module.exports = {parse}
