function parse(content, rawJson=false) {
    const nameParser = require('./nameParser');
    const function_call_argsParser = require('./function_call_argsParser');
    
    var moOutput = "";
    
    if (content.function_name != null) {
        moOutput+=nameParser.parse(content.function_name, rawJson);
    }

    if (content.function_call_args != null) {
        moOutput+=function_call_argsParser.parse(content.function_call_args, rawJson);
    }
    return moOutput;
}

module.exports = {parse};