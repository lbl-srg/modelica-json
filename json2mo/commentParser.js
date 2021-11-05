function parse(content, rawJson=false) {
    const util = require('util');
    const annotationParser = require('./annotationParser');

    var moOutput = "";
    if (rawJson) {
        if (content.string_comment != null) {
            moOutput+=util.format("%s ", content.string_comment);
        }
        if (content.annotation != null) {
            moOutput+=annotationParser.parse(content.annotation, rawJson);
        }
        moOutput+="\n";
    } else {
        if (content.description_string != null) {
            moOutput+=util.format("%s ", content.description_string);
        }
        if (content.annotation != null) {
            moOutput+=annotationParser.parse(content.annotation, rawJson);
        }
        moOutput+="\n";
    }

    return moOutput;
}

module.exports = {parse};