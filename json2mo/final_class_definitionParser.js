function parse(content, rawJson=false) {
    const class_definitionParser = require('./class_definitionParser');
    
    var moOutput = "";
    var is_final = false;

    if (rawJson){
        is_final = content.is_final;   
    } else {
        is_final = content.final;
    }
    if (is_final != null) {
        if (is_final) {
            moOutput+= "final ";
        }
    }

    if (rawJson) {
        if (content.class_definition != null) {
            moOutput+=class_definitionParser.parse(content.class_definition, rawJson);
        }
    } else {
        var class_definition = content;
        moOutput+=class_definitionParser.parse(class_definition, rawJson);
    }
    
    return moOutput;
}

module.exports = {parse};