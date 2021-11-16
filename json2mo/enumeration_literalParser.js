function parse(content, rawJson=false) {
    const util = require('util');
    const commentParser = require('./commentParser');

    var moOutput = "";

    if (enumeration_literal.identifier != null) {
        moOutput+=util.format("%s ", enumeration_literal.identifier);
    }
    if (rawJson) {
        if (enumeration_literal.comment != null) {
            moOutput+=commentParser.parse(enumeration_literal.comment);
        }
    } else {
        if (enumeration_literal.description != null) {
            moOutput+=commentParser.parse(enumeration_literal.description);
        }
    }
    
    return moOutput;
}

module.exports = {parse};