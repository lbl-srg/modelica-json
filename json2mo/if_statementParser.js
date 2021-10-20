function parse(content) {
    const if_elseif_statementParser = require('./if_elseif_statementParser');
    const statementParser = require('./statementParser');
    
    var moOutput = "";
    var if_elseifs = content.if_elseif
    if (if_elseifs != null) {
        if_elseifs.forEach(if_elseif_statement => {
            moOutput+="elseif "
            moOutput+=if_elseif_statementParser.parse(if_elseif_statement);
        });
    }
    moOutput = moOutput.slice(4, moOutput.length); //to remove 1st else of elseif so that we get "if"
    
    var else_statements = content.else_statement;
    if (else_statements != null) {
        elseOutput= "";
        else_statements.forEach(else_statement => {
            elseOutput+=statementParser.parser(else_statement);
            elseOutput+=";\n"
        });
        if (elseOutput != "") {
            moOutput+="else \n";
            moOutput+=elseOutput
        }
    }
    moOutput+="end if\n"
    return moOutput;
}

module.exports = {parse};