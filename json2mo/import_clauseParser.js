function parse(content) {
    const util = require('util');
    const nameParser = require('./nameParser');
    const commentParser = require('./commentParser');
    const import_listParser = require('./import_listParser');
    
    var moOutput = "";
    moOutput+="import ";

    var name=""; 
    if (content.name != null) {
        name = nameParser.parse(content.name);
    }
    
    if (content.identifier != null) { 
        moOutput+=util.format("%s = %s ", identifier, name);
    } else if (content.dot_star != null) {
        if (content.dot_star) {
            moOutput=util.format("%s", name) + ".* ";
        }
    } else if (content.import_list != null) {
        moOutput+=util.format("%s", name)+".{"+import_listParser.parse(content.import_list)+"} "
    } else {
        moOutput+=util.format("%s ", name);
    }
     
    if (content.comment != null) {
        moOutput+=commentParser.parse(content.comment);
    }
    return moOutput;
}
module.exports = {parse};