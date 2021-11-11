function parse(content, rawJson=false) {
    const util = require('util');
    const equationParser = require('./equationParser');

    var moOutput = "";
    if (content.initial != null) {
        if (content.initial) {
            moOutput+="initial "
        }
    }
    moOutput+="equation \n"
    var equations;
    if (rawJson) {
        equations = content.equations; 
    } else {
        equations = content.equation;
    }
    if (equations != null) { 
        equations.forEach(equation => {
            moOutput+=equationParser.parse(equation, rawJson);
            moOutput=moOutput.slice(0,-1); //to remove last new line and to add semicolon
            moOutput+=";\n"
        });
    }
    return moOutput;
}

module.exports = {parse};