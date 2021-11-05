function parse(content, rawJson=false) {
    const util = require('util');
    const der_class_specifier_valueParser = require('./der_class_specifier_valueParser');
    
    var moOutput = "";
    var identifier = content.identifier;

    if (identifier != null) {
        moOutput+=util.format("%s= ", identifier);
    }

    if (content.der_class_specifier_value != null) {
        moOutput+=der_class_specifier_valueParser.parse(content.der_class_specifier_value, rawJson);
    }    
    return moOutput;
}

module.exports = {parse};