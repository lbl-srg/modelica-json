function parse(content) {
    const declarationParser = require('./declarationParser');
    const condition_attributeParser = require('./condition_attributeParser');
    const commentParser = require('./commentParser');

    var moOutput = "";
    if (content.declaration != null) {
        moOutput+=declarationParser.parse(content.declaration);
    }
    if (content.condition_attribute != null) {
        moOutput+=condition_attributeParser.parser(content.condition_attribute);
    }
    if (content.comment != null) {
        moOutput+=commentParser.parse(content.comment);
    }
    return moOutput;
}

module.exports = {parse};