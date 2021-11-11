function parse(content, rawJson=false) {
    const util = require('util');
    const nameParser = require('./nameParser');
    const commentParser = require('./commentParser');
    const import_listParser = require('./import_listParser');
    
    var moOutput = "";
    moOutput+="import ";

    var name=""; 
    if (content.name != null) {
        name = nameParser.parse(content.name, rawJson);
    }
    
    if (content.identifier != null) { 
        moOutput+=util.format("%s = %s ", identifier, name);
    } else if (content.dot_star != null) {
        if (content.dot_star) {
            moOutput=util.format("%s", name) + ".* ";
        }
    } else if (content.import_list != null) {
        if (rawJson) {
            moOutput+=util.format("%s", name)+".{"+import_listParser.parse(content.import_list, rawJson)+"} ";
        }  else {
            moOutput+=util.format("%s", name)+util.format(".{%s} ", content.import_list);
        }
    } else {
        moOutput+=util.format("%s ", name);
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