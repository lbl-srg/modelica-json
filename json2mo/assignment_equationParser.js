function parse(content) {
    const simple_expressionParser = require('./simple_expressionParser');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    if (content.lhs != null) {
        moOutput+=simple_expressionParser.parse(content.lhs)
    }
    moOutput+="="
    if (content.rhs != null) {
        moOutput+=expressionParser.parse(content.rhs)
    }
    return moOutput;
}

module.exports = {parse};