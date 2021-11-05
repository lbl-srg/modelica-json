function parse(content, rawJson=false) {
    const for_indicesParser = require('./for_indicesParser');
    const statementParser = require('./statementParser');

    var moOutput = "";
    moOutput+="for "
    if (content.for_indices != null) {
        moOutput+=for_indicesParser.parse(content.for_indices, rawJson);
    }
    moOutput+="loop \n"

    loop_statements = content.loop_statements
    loop_statements.forEach(loop_statement => {
        moOutput+=statementParser.parse(loop_statement, rawJson);
        moOutput+=';\n';
    });
    moOutput+="end for";
    return moOutput;
}

module.exports = {parse};