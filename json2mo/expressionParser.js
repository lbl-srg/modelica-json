function parse(content) {
    const util = require('util');
    const simple_expressionParser = require('./simple_expressionParser');
    const if_expressionParser = require('./if_expressionParser');
    var moOutput = "";
    
    if (content.if_expression != null) { 
        moOutput+=if_expressionParser.parse(content.if_expression);
    } else if (content.simple_expression != null) {
        moOutput+=simple_expressionParser.parse(content.simple_expression);
    }

    return moOutput;
}

module.exports = {parse};