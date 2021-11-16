function parse(content, rawJson=false) {
    const util = require('util');
    const compositionParser = require('./compositionParser');
    const class_modificationParser = require('./class_modificationParser');
    
    var identifier = content.identifier;
    var is_extends = content.is_extends;

    var moOutput = "";

    if (is_extends != null) {
        if (is_extends) {
            moOutput+= "extends ";
        }
    }

    if (identifier != null) {
        moOutput+=util.format("%s", identifier);
    }
    
    if (is_extends != null) {
        if (is_extends) {
            if (content.class_modification != null) { 
                moOutput+= class_modificationParser.parse(content.class_modification, rawJson);
            }
        }
    }

    if (rawJson) {
        var string_comment = content.string_comment;
        if (string_comment != null) {
            moOutput+=util.format("\n%s\n", string_comment);
        }
    } else {
        var description_string = content.description_string;
        if (description_string != null) {
            moOutput+=util.format("\n%s\n", description_string);
        }
    }

    if (content.composition!=null) {
        moOutput+=compositionParser.parse(content.composition, rawJson);
    }

    moOutput+=util.format("end %s;", identifier);
    return moOutput;
}

module.exports = {parse};