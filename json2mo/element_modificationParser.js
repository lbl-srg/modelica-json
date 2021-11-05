function parse(content, rawJson=false) {
    const util = require('util');
    const nameParser = require('./nameParser');
    const modificationParser = require('./modificationParser');
    
    var moOutput = "";
    if (content.name != null) {
        moOutput+=nameParser.parse(content.name, rawJson);
    }
    if (content.modification != null) {
        moOutput+=modificationParser.parse(content.modification, rawJson);
    }
    if (content.string_comment != null) {
        moOutput+=util.format("%s", content.string_comment, rawJson);
    }
    return moOutput;
}

module.exports = {parse};