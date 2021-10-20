function parse(content) {
    const util = require('util');
    const nameParser = require('./nameParser');
    const modificationParser = require('./modificationParser');
    
    var moOutput = "";
    if (content.name != null) {
        moOutput+=nameParser.parse(content.name);
    }
    if (content.modification != null) {
        moOutput+=modificationParser.parse(content.modification);
    }
    if (content.string_comment != null) {
        moOutput+=util.format("%s", content.string_comment);
    }
    return moOutput;
}

module.exports = {parse};