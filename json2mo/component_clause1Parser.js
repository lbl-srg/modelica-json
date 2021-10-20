function parse(content) {
    const util = require('util');
    const type_specifierParser = require('./type_specifierParser');
    const component_declaration1Parser = require('./component_declaration1Parser');
    
    var moOutput = "";
    if (content.type_prefix != null) {
        moOutput+=util.format("%s ", content.type_prefix);
    }
    if (content.type_specifier != null) {
        moOutput+=type_specifierParser.parse(content.type_specifier);
    }
    if (content.component_declaration1 != null) {
        moOutput+=component_declaration1Parser.parse(content.component_declaration1);
    }
    return moOutput;
}

module.exports = {parse};