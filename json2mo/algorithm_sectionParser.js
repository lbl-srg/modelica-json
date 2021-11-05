function parse(content, rawJson=false) {
    const statementParser = require('./statementParser');

    var moOutput = "";
    if (content.initial != null) {
        if (content.initial) {
            moOutput+="initial "
        }
    }
    moOutput+="algorithm \n"
    var statements = content.statements;
    if (statements != null) { 
        statements.forEach(statement => {
            moOutput+=statementParser.parse(statement, rawJson);
            moOutput+=";\n"
        });
    }
    return moOutput;
}

module.exports = {parse};