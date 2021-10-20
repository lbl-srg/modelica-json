function parse(content) {
    const util = require('util');
    const argumentParser = require('./argumentParser');
    var moOutput = "";
    var arguments = content.arguments;
    
    if (arguments != null) {
        arguments.forEach(argument => {
            moOutput+=argumentParser.parse(argument);
            moOutput+=", ";
        });
        moOutput = moOutput.slice(0, -2);
    }
    return moOutput;
}

module.exports = {parse};