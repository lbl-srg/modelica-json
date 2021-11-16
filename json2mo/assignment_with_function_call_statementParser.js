function parse(content, rawJson=false) {
    const component_referenceParser = require('./component_referenceParser');
    const output_expression_listParser = require('./output_expression_listParser');
    const function_call_argsParser = require('./function_call_argsParser');
    
    var moOutput = "";
    moOutput+="(";
    if (content.output_expression_list != null) {
        moOutput+=output_expression_listParser.parse(content.output_expression_list, rawJson);
    }
    moOutput+=")";
    moOutput+=":=";
    if (content.function_name != null) {
        moOutput+=component_referenceParser.parse(content.function_name, rawJson);
    }
    if (content.function_call_args != null) { 
        moOutput+=function_call_argsParser.parse(content.function_call_args, rawJson);
    }
    return moOutput;
}

module.exports = {parse};