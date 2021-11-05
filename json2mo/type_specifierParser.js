function parse(content, rawJson=false) {
    const util = require('util');
    const nameParser = require('./nameParser');

    var moOutput = "";
    if (rawJson) {
        if (content.name != null) {
            moOutput+=nameParser.parse(content.name, rawJson);
        }
    } else {
        var name = content;
        moOutput+=util.format("%s ", name);
    }
    
    return moOutput;
}

module.exports = {parse};