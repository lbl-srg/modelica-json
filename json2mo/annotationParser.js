function parse(content) {
    const util = require('util');
    const class_modificationParser = require('./class_modificationParser');

    var moOutput = "";
    moOutput+="annotation ";
    if (content.class_modification != null) {
        moOutput+=class_modificationParser.parse(content.class_modification);
    }
    return moOutput;
}

module.exports = {parse};