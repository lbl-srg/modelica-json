function parse(content) {
    const class_definitionParser = require('./class_definitionParser');
    var is_final = content.is_final;
    var moOutput = "";

    if (is_final != null) {
        if (is_final) {
            moOutput+= "final ";
        }
    }
    if (content.class_definition != null) {
        moOutput+=class_definitionParser.parse(content.class_definition);
    }    
    return moOutput;
}

module.exports = {parse};