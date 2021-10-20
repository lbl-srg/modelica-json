function parse(content) {
    const util = require('util');
    const array_subscriptsParser = require('./array_subscriptsParser');
    const modificationParser = require('./modificationParser');
    
    var moOutput = "";
    if (content.identifier != null) {
        moOutput+=util.format("%s ", content.identifier);
    }
    if (content.array_subscripts != null) {
        moOutput+=array_subscriptsParser.parse(content.array_subscripts);
    }
    if (content.modification != null) {
        moOutput+=modificationParser.parse(content.modification);
    }
    return moOutput;
}

module.exports = {parse};