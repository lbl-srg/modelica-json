function parse(content) {
    const util = require('util');
    const der_class_specifier_valueParser = require('./der_class_specifier_valueParser');
    
    var moOutput = "";
    var identifier = content.identifier;

    if (identifier != null) {
        moOutput+=util.format("%s= ", identifier);
    }

    if (content.der_class_specifier_value != null) {
        moOutput+=der_class_specifier_valueParser.parse(content.der_class_specifier_value);
    }    
    return moOutput;
}

module.exports = {parse};