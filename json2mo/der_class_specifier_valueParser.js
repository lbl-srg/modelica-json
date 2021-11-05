function parse(content, rawJson=false) {
    const util = require('util');
    const nameParser = require('./nameParser');
    const commentParser = require('./commentParser');
    
    var moOutput = "der(";
    if (content.type_specifier != null) {
        moOutput+=nameParser.parse(content.type_specifier, rawJson);
    }   

    var identifiers = content.identifiers;
    if (identifiers != null) {
        identifiers.forEach(identifier => {
            moOutput+=util.format("%s, ", identifier)
        })
        moOutput = moOutput.slice(0, -2);
        moOutput+=") "
    }
    if (rawJson) {
        if (content.comment != null) {
            moOutput+=commentParser.parse(content.comment, rawJson);
        }
    } else {
        if (content.description != null) {
            moOutput+=commentParser.parse(content.description, rawJson);
        }
    }
    
    return moOutput;
}

module.exports = {parse};