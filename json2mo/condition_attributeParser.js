function parse(content) {
    const expressionParser = require('./expressionParser');

    var moOutput = "";
    moOutput+="if "
    if (content.expression != null) {
        moOutput+=expressionParser.parse(content.expression);
    }    
    return moOutput;
}

module.exports = {parse};