function parse(content, rawJson=false) {
    const component_declarationParser = require('./component_declarationParser');
    const declarationParser = require('./declarationParser');
    const condition_attributeParser = require('./condition_attributeParser');
    const commentParser = require('./commentParser');
    
    var moOutput = "";
    if (rawJson) {
        var component_declaration_list = content.component_declaration_list;

        component_declaration_list.forEach(component_declaration => {
            moOutput+=component_declarationParser.parse(component_declaration, rawJson);
        });
    } else {
        var component_declaration_list = content;
        component_declaration_list.forEach(component_declaration => {
            if (component_declaration.declaration != null) {
                moOutput+=declarationParser.parse(component_declaration.declaration, rawJson);
            }
            if (component_declaration.condition_attribute != null) {
                moOutput+=condition_attributeParser.parse(component_declaration.condition_attribute, rawJson);
            }
            if (component_declaration.description != null) {
                moOutput+=commentParser.parse(component_declaration.description, rawJson);
            }
        });
    }
    
    return moOutput;
}

module.exports = {parse};