function parse(content, rawJson=false) {
    const nameParser = require('./nameParser');
    const class_modificationParser = require('./class_modificationParser');
    const annotationParser = require('./annotationParser');
    
    var moOutput = "";
    moOutput+="extends ";

    if (content.name != null) {
        moOutput+=nameParser.parse(content.name, rawJson);
    }
    if (content.class_modification != null) {
        moOutput+=class_modificationParser.parse(content.class_modification, rawJson);
    }
    if (content.annotation != null) {
        moOutput+=annotationParser.parse(content.annotation, rawJson);
    }
    return moOutput;
}

module.exports = {parse};