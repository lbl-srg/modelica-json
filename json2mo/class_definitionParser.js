function parse(content, rawJson=false) {
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
    moOutput+=class_specifierParser.parse(content.class_specifier, rawJson);
    return moOutput;
}

module.exports = {parse};