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
            moOutput+=";\n"
        });
    }
    return moOutput;
}

module.exports = {parse};