function parse(content) {
    const util = require('util');
    const class_specifierParser = require('./class_specifierParser');
    var encapsulated = content.encapsulated;
    var class_prefixes = content.class_prefixes;
    var moOutput = "";

    if (encapsulated != null) {
        if (encapsulated) {
            moOutput = "encapsulated ";
        }
    }

    if (class_prefixes != null) {
        moOutput += util.format("%s ", class_prefixes);
    }
    
    moOutput+=class_specifierParser.parse(content.class_specifier);
    return moOutput;
}

module.exports = {parse};