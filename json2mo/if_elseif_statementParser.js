function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');
    const statementParser = require('./statementParser');
    
    var moOutput = "";
    
    if (content.condition != null) {
        moOutput+=expressionParser.parse(content.condition, rawJson);
    } 
    
    var then_statements = content.then;
    var thenOutput = "";
    if (then_statements != null) {
        thenOutput= "";
        then_statements.forEach(then_statement => {
            thenOutput+=statementParser.parser(then_statement, rawJson);
            thenOutput+=";\n"
        });
        if (thenOutput != "") {
            moOutput+=" then \n";
            moOutput+=thenOutput;
        }
    }
    return moOutput;
}

module.exports = {parse};