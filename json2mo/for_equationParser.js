function parse(content) {
    const for_indicesParser = require('./for_indicesParser');
    const equationParser = require('./equationParser');

    var moOutput = "";
    moOutput+="for "
    if (content.for_indices != null) {
        moOutput+=for_indicesParser.parse(content.for_indices);
    }
    moOutput+="loop \n"

    loop_equations = content.loop_equations
    loop_equations.forEach(loop_equation => {
        moOutput+=equationParser.parse(loop_equation);
        moOutput+=';\n';
    });
    moOutput+="end for";
    return moOutput;
}

module.exports = {parse};