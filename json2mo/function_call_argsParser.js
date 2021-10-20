function parse(content) {
    const named_argumentParser = require('./named_argumentParser');
    const function_argumentParser = require('./function_argumentParser');
    const function_argumentsParser = require('./function_argumentsParser');
    const for_indicesParser = require('./for_indicesParser');
    var moOutput = "";
    moOutput+="(";

    var named_arguments = content.named_arguments; //only in simplified-json

    if (named_arguments != null) {
        named_arguments.forEach(named_argument => {
            moOutput+=named_argumentParser.parse(named_argument);
            moOutput+=", "
        });
        moOutput=moOutput.slice(0, -1);
    } else {
        if (content.function_argument != null) {
            moOutput+=function_argumentParser.parse(content.function_argument);

            if (content.function_arguments != null) {
                moOutput+=", "
                moOutput+=function_argumentsParser.parse(content.function_arguments);
            } else if ( content.for_indices != null) {
                moOutput+=" for ";
                moOutput+=for_indicesParser.parse(content.for_indices);
            }
        }
    }
    moOutput+=")";
    return moOutput;
}

module.exports = {parse};