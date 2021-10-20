function parse(content) {
    const util = require('util');
    const nameParser = require('./nameParser');
    const commentParser = require('./commentParser');
    
    var moOutput = "der(";
    if (content.type_specifier != null) {
        moOutput+=nameParser.parse(content.type_specifier);
    }   

    var identifiers = content.identifiers;
    if (identifiers != null) {
        identifiers.forEach(identifier => {
            moOutput+=util.format("%s, ", identifier)
        })
        moOutput = moOutput.slice(0, -2);
        moOutput+=") "
    }
    
    if (content.comment != null) {
        moOutput+=commentParser.parse(content.content);
    }
    return moOutput;
}

module.exports = {parse};