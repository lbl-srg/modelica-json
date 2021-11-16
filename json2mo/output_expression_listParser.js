function parse(content, rawJson=false) {
    const util = require('util');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    var output_expressions = null;
    if (rawJson) {
        output_expressions = content.output_expressions;
    } else {
        output_expressions = content;
    }
    if (output_expressions != null) {
        output_expressions.forEach(expression => {
            moOutput+=expressionParser.parse(expression, rawJson);
            moOutput+=", ";
        });
        moOutput = moOutput.slice(0, -1);
    }    
    return moOutput;
}

module.exports = {
};