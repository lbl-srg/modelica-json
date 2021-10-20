function parse(content) {
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    
    if (content.condition != null) {
        moOutput+=expressionParser.parse(content.condition);
    } 
    moOutput+="then \n";
    
    if (content.then != null) {
        moOutput+=expressionParser.parser(content.then);
        thenOutput+=";\n"
    }
    return moOutput;
}

module.exports = {parse};