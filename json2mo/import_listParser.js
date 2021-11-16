function parse(content, rawJson=false) {
    const util = require('util');
    
    var moOutput = "";
    var identifier_list = content.identifier_list;
    if (identifier_list != null) {
        identifier_list.forEach(identifier => {
            moOutput+=util.format("%s, ", identifier);
        });
    }
    moOutput = moOutput.slice(0, -2);
    return moOutput;
}

module.exports = {parse};