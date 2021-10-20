function parse(content) {
    const util = require('util');
    const annotationParser = require('./annotationParser');

    var moOutput = "";
    if (content.string_comment != null) {
        moOutput+=util.format("%s ", content.string_comment);
    }
    if (content.annotation != null) {
        moOutput+=annotationParser.parse(content.annotation);
    }
    moOutput+="\n";
    return moOutput;
}

module.exports = {parse};