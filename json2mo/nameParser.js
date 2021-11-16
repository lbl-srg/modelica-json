function parse(content, rawJson=false) {
    const util = require('util');
    const name_partParser = require('./name_partParser');

    var moOutput = "";
    if (rawJson) {
        var name_parts = content.name_parts;
        if (name_parts != null) {
            name_parts.forEach(name_part => {
                moOutput+=name_partParser.parse(name_part, rawJson);
            });
        }
        moOutput+=" ";
    } else {
        moOutput+=util.format("%s ", content);
    }    
    return moOutput;
}

module.exports = {parse};