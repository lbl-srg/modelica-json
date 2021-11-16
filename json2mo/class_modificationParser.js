function parse(content, rawJson=false) {
    const argument_listParser = require('./argument_listParser');
    const argumentParser = require('./argumentParser');

    var moOutput = "";
    if (rawJson) {
        moOutput+="(";
        if (content.argument_list != null) {
            moOutput+=argument_listParser.parse(content.argument_list, rawJson);
        }
        moOutput+=")"
    } else {
        var argument_list = content;
        moOutput+="(";

        argument_list.forEach(argument => {
            moOutput+=argumentParser.parse(argument, rawJson);
            moOutput+=", ";
        });
        
        moOutput = moOutput.slice(0, -2);
        moOutput+=")"
    }
    return moOutput;
}

module.exports = {parse};