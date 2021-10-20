function parse(content) {
    const util = require('util');
    const final_class_definitionParser = require('./final_class_definitionParser');

    var within = content.within; 

    var moOutput = "";
    if (within != null) {
        moOutput+=util.format("within %s;\n", within)
    }

    if (content.final_class_definitions != null) {
        content.final_class_definitions.forEach(final_class_definition => {
            moOutput+=final_class_definitionParser.parse(final_class_definition);
            moOutput+="\n";
        }); 
    }
    return moOutput;
}

module.exports = {parse};