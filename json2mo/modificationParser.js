function parse(content, rawJson=false) {
    const class_modificationParser = require('./class_modificationParser');
    const expressionParser = require('./expressionParser');
    var moOutput = "";

    if (content.class_modification != null) {
        moOutput+=class_modificationParser.parse(content.class_modification, rawJson);
    }

    if (content.equal != null) {
        if (content.equal) {
            moOutput+= "=";
        }
    } else if (content.colon_equal != null) { 
        if (content.colon_equal) {
            moOutput+= ":=";
        }
    }
    if (content.expression != null) {
        moOutput+=expressionParser.parse(content.expression, rawJson);
    }
    return moOutput;
}

module.exports = {parse};