function parse(content) {
    const util = require('util');
    const arrary_subscriptsParser = require('./arrary_subscriptsParser');

    var moOutput = "";
    var component_reference_parts = content; //only if simplified-json

    component_reference_parts.forEach(component_reference_part => {
        if (component_reference_part.dot_op != null) { 
            if(component_reference_part.dot_op) {
                moOutput+="."
            }            
        }
        if (component_reference_part.identifier != null) {
            moOutput+=util.format("%s", component_reference_part.identifier);
        }
        if (component_reference_part.arrary_subscripts != null) {
            moOutput+=arrary_subscriptsParser.parse(component_reference_part.arrary_subscripts);
        }
    });
    moOutput+=" ";
    return moOutput;
}

module.exports = {parse};