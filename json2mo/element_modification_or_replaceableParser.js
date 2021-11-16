function parse(content, rawJson=false) {
    const element_modificationParser = require('./element_modificationParser');
    const element_replaceableParser = require('./element_replaceableParser');
    
    var moOutput = "";
    if (content.each != null) {
        if (content.each){
            moOutput+="each ";
        }
    }
    if (rawJson) {
        if (content.is_final != null) {
            if (content.is_final){
                moOutput+="final ";
            }
        }
    } else {
        if (content.final != null) {
            if (content.final){
                moOutput+="final ";
            }
        }
    }
    
    if (content.element_modification != null) {
        moOutput+=element_modificationParser.parse(content.element_modification, rawJson);
    } else if (content.element_replaceable != null) {
        moOutput+=element_replaceableParser.parse(content.element_replaceable, rawJson);
    }
    return moOutput;
}

module.exports = {parse};