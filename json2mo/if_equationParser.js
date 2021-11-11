function parse(content, rawJson=false) {
    const if_elseif_equationParser = require('./if_elseif_equationParser');
    const equationParser = require('./equationParser');
    
    var moOutput = "";
    var if_elseifs = content.if_elseif
    if (if_elseifs != null) {
        if_elseifs.forEach(if_elseif_equation => {
            moOutput+="elseif "
            moOutput+=if_elseif_equationParser.parse(if_elseif_equation, rawJson);
        });
    }
    moOutput = moOutput.slice(4, moOutput.length); //to remove 1st else of elseif so that we get "if"
    
    var else_equations = content.else_equation;
    if (else_equations != null) {
        elseOutput= "";
        else_equations.forEach(else_equation => {
            elseOutput+=equationParser.parser(else_equation, rawJson);
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