function parse(content, rawJson) {
    const short_class_definitionParser = require('./short_class_definitionParser');
    const component_clause1Parser = require('./component_clause1Parser');
    const element_replaceableParser = require('./element_replaceableParser');
    
    var moOutput = "";
    moOutput+="redeclare ";

    if (content.each != null) {
        if (content.each){
            moOutput+="each ";
        }
    }
    if (content.is_final != null) {
        if (content.is_final){
            moOutput+="final ";
        }
    }
    if (content.element_replaceable != null) {
        moOutput+=element_replaceableParser.parse(content.element_replaceable, rawJson);
    } else {
        if (content.short_class_definition != null) {
            moOutput+=short_class_definitionParser.parse(content.short_class_definition, rawJson);
        } else if (content.component_clause1 != null) {
            moOutput+=component_clause1Parser.parse(content.component_clause1, rawJson);
        }
    }
    return moOutput;
}

module.exports = {parse};