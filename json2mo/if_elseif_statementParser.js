function parse(content) {
    const expressionParser = require('./expressionParser');
    const statementParser = require('./statementParser');
    
    var moOutput = "";
    
    if (content.condition != null) {
        moOutput+=expressionParser.parse(content.condition);
    } 
    
    var then_statements = content.then;
    if (then_statements != null) {
        thenOutput= "";
        then_statements.forEach(then_statement => {
            thenOutput+=statementParser.parser(then_statement);
            thenOutput+=";\n"
        });
        if (thenOutput != "") {
            moOutput+="then \n";
            moOutput+=thenOutput;
        }
    }
    return moOutput;
}

module.exports = {parse};