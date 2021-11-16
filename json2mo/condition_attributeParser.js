function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');

    var moOutput = "";
    moOutput+="if "
    if (rawJson) {
        if (content.expression != null) {
            moOutput+=expressionParser.parse(content.expression, rawJson);
        }    
    } else {
        var expression = content;
        if (expression != null) {
            moOutput+=expressionParser.parse(expression, rawJson);
        }    
    }
    
    return moOutput;
}

module.exports = {parse};