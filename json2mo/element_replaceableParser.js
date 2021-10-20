function parse(content) {
    const short_class_definitionParser = require('./short_class_definitionParser');
    const component_clause1Parser = require('./component_clause1Parser');
    const constraining_clauseParser = require('./constraining_clauseParser');
    
    var moOutput = "";
    moOutput+="replaceable ";
    if (content.short_class_definition != null) {
        moOutput+=short_class_definitionParser.parse(content.short_class_definition);
    } else if (content.component_clause1 != null) {
        moOutput+=component_clause1Parser.parse(content.component_clause1);
    }
    if (content.constraining_clause != null) {
        moOutput+=constraining_clauseParser.parse(content.constraining_clause);
    }
    return moOutput;
}

module.exports = {parse};