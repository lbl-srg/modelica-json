function parse(content, rawJson=false) {
    const base_prefixParser = require('./base_prefixParser');
    const nameParser = require('./nameParser');
    const array_subscriptsParser = require('./array_subscriptsParser');
    const class_modificationParser = require('./class_modificationParser');
    const commentParser = require('./commentParser');
    const enum_listParser = require('./enum_listParser');

    var moOutput = "";
    
    if (content.base_prefix == null) {
        moOutput+="enumeration (";
        if (content.enum_list != null) {
            moOutput+=enum_listParser.parse(content.enum_list, rawJson)
        } else {
            moOutput+=":"
        }
        moOutput+=") "
    } else {
        moOutput+=base_prefixParser.parse(content.base_prefix, rawJson);
        if (content.name != null) {
            moOutput+=nameParser.parse(content.name, rawJson);
        }        
        if (content.array_subscripts != null) {
            moOutput+=array_subscriptsParser.parse(content.array_subscripts, rawJson);
        }
        if(content.class_modification != null) {
            moOutput+=class_modificationParser.parse(content.class_modification, rawJson);
        }
    }
    if (rawJson) {
        if (content.comment != null) {
            moOutput+=commentParser.parse(content.comment, rawJson);
        }
    } else {
        if (content.description != null) {
            moOutput+=commentParser.parse(content.description, rawJson);
        }        
    }
    
    return moOutput;
}

module.exports = {parse};