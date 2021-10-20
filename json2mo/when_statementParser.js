function parse(content) {
    const expressionParser = require('./expressionParser');
    const statementParser = require('./statementParser');

    var moOutput = "";
    var when_elsewhens = content //different if it was raw-json

    if (when_elsewhens != null) {
        
        when_elsewhens.forEach(when_elsewhen => {
            moOutput+="elsewhen "
            if (when_elsewhen.condition != null) {
                moOutput+=expressionParser.parse(when_elsewhen.condition);
            }
            moOutput+="\n";
            then_statements = when_elsewhen.then;
            thenOutput = "";
            if (then_statements!=null) {
                then_statements.forEach(then_statement => {
                    thenOutput+=statementParser.parse(then_statement);
                    thenOutput+=";\n";
                });
            }
            
            if (thenOutput != "") {
                moOutput+="then \n";
                moOutput+=thenOutput;
            }
        });
        moOutput=moOutput.slice(4, moOutput.length);
    }
    moOutput+="end when \n"
    return moOutput;
}

module.exports = {parse};