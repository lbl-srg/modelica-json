function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');

    var moOutput = "";
    moOutput+="if "
    if (content.expression != null) {
        moOutput+=expressionParser.parse(content.expression, rawJson);
    }    
    return moOutput;
}

module.exports = {parse};