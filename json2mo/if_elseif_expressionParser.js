function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    
    if (content.condition != null) {
        moOutput+=expressionParser.parse(content.condition, rawJson);
    } 
    moOutput+="then \n";
    
    if (content.then != null) {
        moOutput+=expressionParser.parser(content.then, rawJson);
        thenOutput+=";\n"
    }
    return moOutput;
}

module.exports = {parse};