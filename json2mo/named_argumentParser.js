function parse(content, rawJson=false) {
    const util = require('util');
    const function_argumentParser = require('./function_argumentParser');

    var moOutput = "";
    if (content.identifier != null) {
        moOutput+=util.format("%s=", content.identifier);
    }
    if (content.value != null) {
        moOutput+=function_argumentParser.parse(content.value, rawJson);
    }

    return moOutput;
}

module.exports = {parse};