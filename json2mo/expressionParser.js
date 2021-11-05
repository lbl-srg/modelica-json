function parse(content, rawJson=false) {
    const util = require('util');
    const simple_expressionParser = require('./simple_expressionParser');
    const if_expressionParser = require('./if_expressionParser');
    var moOutput = "";
    
    if (content.if_expression != null) { 
        moOutput+=if_expressionParser.parse(content.if_expression, rawJson);
    } else if (content.simple_expression != null) {
        moOutput+=simple_expressionParser.parse(content.simple_expression, rawJson);
    }

    return moOutput;
}

module.exports = {parse};