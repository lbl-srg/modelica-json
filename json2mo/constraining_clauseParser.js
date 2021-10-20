function parse(content) {
    const nameParser = require('./nameParser');
    const class_modificationParser = require('./class_modificationParser');
    
    var moOutput = "";
    moOutput+="constraintedby ";

    var name=""; 
    if (content.name != null) {
        moOutput+= nameParser.parse(content.name);
    }

    if (content.class_modification != null) {
        moOutput+=class_modificationParser.parse(content.class_modification);
    }
    return moOutput;
}
module.exports = {parse};