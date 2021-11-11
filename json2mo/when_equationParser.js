function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');
    const equationParser = require('./equationParser');

    var moOutput = "";
    var when_elsewhens = null;
    if (rawJson) {
        when_elsewhens = content.when_elsewhen;
    } else {
        when_elsewhens = content;
    }    

    if (when_elsewhens != null) {
        
        when_elsewhens.forEach(when_elsewhen => {
            moOutput+="elsewhen "
            if (when_elsewhen.condition != null) {
                moOutput+=expressionParser.parse(when_elsewhen.condition, rawJson);
            }
            moOutput+="\n";
            then_equations = when_elsewhen.then;
            thenOutput = "";
            if (then_equations!=null) {
                then_equations.forEach(then_equation => {
                    thenOutput+=equationParser.parse(then_equation, rawJson);
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