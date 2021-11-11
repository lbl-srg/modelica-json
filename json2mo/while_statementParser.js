function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');
    const statementParser = require('./statementParser');

    var moOutput = "";
    moOutput+="while "
    if (content.condition != null) { //in simplified json
        moOutput+=expressionParser.parse(content.condition, rawJson);
    }
    moOutput+="loop \n"

    loop_statements = content.loop_statements
    loop_statements.forEach(loop_statement => {
        moOutput+=statementParser.parse(loop_statement, rawJson);
        moOutput+=';\n';
    });
    moOutput+="end while";
    return moOutput;
}

module.exports = {parse};