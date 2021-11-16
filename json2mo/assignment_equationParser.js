function parse(content, rawJson=false) {
    const simple_expressionParser = require('./simple_expressionParser');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    if (content.lhs != null) {
        moOutput+=simple_expressionParser.parse(content.lhs, rawJson);
    }
    moOutput+="="
    if (content.rhs != null) {
        moOutput+=expressionParser.parse(content.rhs, rawJson);
    }
    return moOutput;
}

module.exports = {parse};