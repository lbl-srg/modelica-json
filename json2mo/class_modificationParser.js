function parse(content) {
    const argument_listParser = require('./argument_listParser');
    
    var moOutput = "";
    moOutput+="(";
    if (content.argument_list != null) {
        moOutput+=argument_listParser.parse(content.argument_list);
    }
    moOutput+=")"
    return moOutput;
}

module.exports = {parse};