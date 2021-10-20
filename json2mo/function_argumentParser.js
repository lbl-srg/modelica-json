function parse(content) {
    const nameParser = require('./nameParser');
    const named_argumentParser = require('./named_argumentParser');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";

    if (content.function_name!= null) {
        moOutput+="function ";
        moOutput+=nameParser.parse(content.function_name);
        moOutput+="(";
        var named_arguments = content.named_arguments;
        if (named_arguments != null) {
            named_arguments.forEach(named_argument => {
                moOutput+=named_argumentParser.parse(named_argument);
            });
        }
        moOutput+=") ";
    } else if (content.expression != null) {
        moOutput+=expressionParser.parser(content.expression);
    }
    
    return moOutput;
}

module.exports = {parse};