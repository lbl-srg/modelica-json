function parse(content) {
    const util = require('util');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    var output_expression_list = content;
    if (output_expression_list != null) {
        output_expression_list.forEach(expression => {
            moOutput+=expressionParser.parse(expression);
            moOutput+=", ";
        });
        moOutput = moOutput.slice(0, -1);
    }
    return moOutput;
}

module.exports = {parse};