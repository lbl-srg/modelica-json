function parse(content) {
    const long_class_specifierParser = require('./long_class_specifierParser');
    const short_class_specifierParser = require('./short_class_specifierParser');
    const der_class_specifierParser = require('./der_class_specifierParser');

    var long_class_specifier = content.long_class_specifier;
    var short_class_specifier = content.short_class_specifier;
    var der_class_specifier = content.der_class_specifier;

    var moOutput = "";

    if (long_class_specifier != null) {
        moOutput+=long_class_specifierParser.parse(long_class_specifier);
    }

    if (short_class_specifier != null) {
        moOutput+=short_class_specifierParser.parse(short_class_specifier);
    }

    if (der_class_specifier != null) {
        moOutput+=der_class_specifierParser.parse(der_class_specifier);
    }

    return moOutput;
}

module.exports = {parse};