function parse(content, rawJson=false) {
    const util = require('util');
    const array_subscriptsParser = require('./array_subscriptsParser');
    const component_reference_partParser = require('./component_reference_partParser');

    var moOutput = "";
    
    if (!rawJson) {
        var component_reference_parts = content; 
        component_reference_parts.forEach(component_reference_part => {
            if (component_reference_part.dot_op != null) { 
                if(component_reference_part.dot_op) {
                    moOutput+="."
                }            
            }
            if (component_reference_part.identifier != null) {
                moOutput+=util.format("%s", component_reference_part.identifier);
            }
            if (component_reference_part.array_subscripts != null) {
                moOutput+=array_subscriptsParser.parse(component_reference_part.array_subscripts, rawJson);
            }
        });
        return moOutput;
    } else {
        var component_reference_parts = content.component_reference_parts
        if (component_reference_parts != null) {
            component_reference_parts.forEach(component_reference_part => {
                moOutput+=component_reference_partParser.parse(component_reference_part, rawJson)
            });
        }
        return moOutput;
    }
    
}

module.exports = {parse};