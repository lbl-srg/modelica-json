function parse(content, rawJson=false) {
    const nameParser = require('./nameParser');
    const class_modificationParser = require('./class_modificationParser');
    
    var moOutput = "";
    moOutput+="constrainedby ";

    if (content.name != null) {
        moOutput+= nameParser.parse(content.name, rawJson);
    }

    if (content.class_modification != null) {
        moOutput+=class_modificationParser.parse(content.class_modification, rawJson);
    }
    return moOutput;
}
module.exports = {parse};