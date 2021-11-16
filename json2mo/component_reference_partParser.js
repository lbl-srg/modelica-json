function parse(content, rawJson=false) {
    const util = require('util');
    const array_subscriptsParser = require('./array_subscriptsParser');
    
    var moOutput = "";
    
    if (rawJson) {
        if (content.dot_op != null) { 
            if(content.dot_op) {
                moOutput+="."
            }            
        }
        if (content.identifier != null) {
            moOutput+=util.format("%s", content.identifier);
        }
        if (content.array_subscripts != null) {
            moOutput+=array_subscriptsParser.parse(content.array_subscripts, rawJson);
        }
    }
    return moOutput;
}

module.exports = {parse};