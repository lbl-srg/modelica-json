function parse(content) {
    const component_declarationParser = require('./component_declarationParser');
    
    var moOutput = "";
    var component_declaration_list = content.component_declaration_list;

    component_declaration_list.forEach(component_declaration => {
        moOutput+=component_declarationParser.parse(component_declaration);
    });
    return moOutput;
}

module.exports = {parse};