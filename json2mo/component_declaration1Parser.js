function parse(content) {
    const util = require('util');
    const declarationParser = require('./declarationParser');
    const commentParser = require('./commentParser');

    var moOutput = "";
    if (content.declaration != null) {
        moOutput+=declarationParser.parse(content.declaration);
    }
    if (content.comment != null) {
        moOutput+=commentParser.parse(content.comment);
    }
    return moOutput;
}
module.exports = {parse};