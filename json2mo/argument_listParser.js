function parse(content, rawJson=false) {
    const util = require('util');
    const argumentParser = require('./argumentParser');
    var moOutput = "";
    if (rawJson) {
        var arguments = content.arguments;
    
        if (arguments != null) {
            arguments.forEach(argument => {
                moOutput+=argumentParser.parse(argument, rawJson);
                moOutput+=",";
            });
            moOutput = moOutput.slice(0, -2);
        }
    }    
    return moOutput;
}

module.exports = {parse};