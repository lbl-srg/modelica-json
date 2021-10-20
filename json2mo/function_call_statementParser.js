function parse(content) {
    const component_referenceParser = require('./component_referenceParser');
    const function_call_argsParser = require('./function_call_argsParser');
    
    var moOutput = "";
    if (content.function_name != null) {
        moOutput+=component_referenceParser.parse(content.function_name)
    }
    if (content.function_call_args != null) {
        moOutput+=function_call_argsParser.parse(content.function_call_args)
    }
    return moOutput;
}

module.exports = {parse};