function parse(content) {
    const util = require('util');
    const short_class_specifierParser = require('./short_class_specifierParser');

    var moOutput = "";
    if (content.class_prefixes != null) {
        moOutput+=util.format("%s ", class_prefixes);
    }
    if (content.short_class_specifier != null) {
        moOutput+=short_class_specifierParser.parse(content.short_class_specifier);
    }
    return moOutput;
}

module.exports = {parse};