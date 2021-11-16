const e = require('express');

function parse(content, rawJson) {
    const util = require('util');
    const declarationParser = require('./declarationParser');
    const commentParser = require('./commentParser');

    var moOutput = "";
    if (content.declaration != null) {
        moOutput+=declarationParser.parse(content.declaration, rawJson);
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