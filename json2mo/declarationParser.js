function parse(content, rawJson=false) {
    const util = require('util');
    const array_subscriptsParser = require('./array_subscriptsParser');
    const modificationParser = require('./modificationParser');
    
    var moOutput = "";
    if (content.identifier != null) {
        moOutput+=util.format("%s ", content.identifier);
    }
    if (content.array_subscripts != null) {
        moOutput+=array_subscriptsParser.parse(content.array_subscripts, rawJson);
    }
    if (content.modification != null) {
        moOutput+=modificationParser.parse(content.modification, rawJson);
    }
    return moOutput;
}

module.exports = {parse};