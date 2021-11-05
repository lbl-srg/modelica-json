function parse(content, rawJson=false) {
    const element_modification_or_replaceableParser = require('./element_modification_or_replaceableParser');
    const element_redeclarationParser = require('./element_redeclarationParser');
    
    var moOutput = "";
    if (content.element_modification_or_replaceable != null) {
        moOutput+=element_modification_or_replaceableParser.parse(content.element_modification_or_replaceable, rawJson)
    } else if (content.element_redeclaration != null) {
        moOutput+=element_redeclarationParser.parse(content.element_redeclaration, rawJson)
    }
    return moOutput;
}

module.exports = {parse};