function parse(content) {
    const util = require('util');
    const commentParser = require('./commentParser');

    var moOutput = "";

    if (enumeration_literal.identifier != null) {
        moOutput+=util.format("%s ", enumeration_literal.identifier);
    }
    if (enumeration_literal.comment != null) {
        moOutput+=commentParser.parse(enumeration_literal.comment);
    }
    return moOutput;
}

module.exports = {parse};