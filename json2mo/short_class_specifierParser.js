function parse(content, rawJson=false) {
    const util = require('util');
    const short_class_specifier_valueParser = require('./short_class_specifier_valueParser');

    var moOutput = "";
    var identifier = content.identifier;

    if (identifier != null) {
        moOutput+=util.format("%s= ", identifier);
    }

    moOutput+=short_class_specifier_valueParser.parse(content.short_class_specifier_value, rawJson);
    return moOutput;
}

module.exports = {parse};