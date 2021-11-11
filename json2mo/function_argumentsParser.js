function parse(content, rawJson=false) {
    const named_argumentsParser = require('./named_argumentsParser');
    const named_argumentParser = require('./named_argumentParser');
    const function_argumentsParser = require('./function_argumentsParser');
    const function_argumentParser = require('./function_argumentParser');
    const for_indicesParser = require('./for_indicesParser');
    var moOutput = "";

    if (rawJson) {
        if (content.named_arguments != null) {
            moOutput+=named_argumentsParser.parse(content.named_arguments, rawJson);
        } else {
            if (content.function_argument != null) {
                moOutput+=function_argumentParser.parse(content.function_argument, rawJson);
            }

            if (content.function_arguments != null) {
                moOutput+=","
                moOutput+=function_argumentsParser.parse(content.function_arguments, rawJson)
            } else if (content.for_indices != null) {
                moOutput+="for "
                moOutput+=for_indicesParser.parse(cotnent.for_indices, rawJson);
            }
        }
    } else {
        var named_arguments = content.named_arguments; //only in simplified-json

        if (named_arguments != null) {
            named_arguments.forEach(named_argument => {
                moOutput+=named_argumentParser.parse(named_argument, rawJson);
                moOutput+=", "
            });
            moOutput=moOutput.slice(0, -1);
        } else {
            if (content.function_argument != null) {
                moOutput+=function_argumentParser.parse(content.function_argument, rawJson);
    
                if (content.function_arguments != null) {
                    moOutput+=", "
                    moOutput+=this.parse(content.function_arguments, rawJson);
                } else if ( content.for_indices != null) {
                    moOutput+=" for ";
                    moOutput+=for_indicesParser.parse(content.for_indices, rawJson);
                }
            }
        }
    }    
    return moOutput;
}

module.exports = {parse};