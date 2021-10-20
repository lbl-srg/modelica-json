function parse(content) {
    const nameParser = require('./nameParser');
    const class_modificationParser = require('./class_modificationParser');
    const annotationParser = require('./annotationParser');
    
    var moOutput = "";
    moOutput+="extends ";

    if (content.name != null) {
        moOutput+=nameParser.parse(content.name);
    }
    if (content.class_modification != null) {
        moOutput+=class_modificationParser.parse(content.class_modification);
    }
    if (content.annotation != null) {
        moOutput+=annotationParser.parse(content.annotation);
    }
    return moOutput;
}

module.exports = {parse};