function parse(content) {
    const expressionParser = require('./expressionParser');
    const statementParser = require('./statementParser');

    var moOutput = "";
    moOutput+="while "
    if (content.condition != null) { //in simplified json
        moOutput+=expressionParser.parse(content.condition);
    }
    moOutput+="loop \n"

    loop_statements = content.loop_statements
    loop_statements.forEach(loop_statement => {
        moOutput+=statementParser.parse(loop_statement);
        moOutput+=';\n';
    });
    moOutput+="end while";
    return moOutput;
}

module.exports = {parse};