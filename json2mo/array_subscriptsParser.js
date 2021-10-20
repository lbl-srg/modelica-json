function parse(content) {
    const expressionParser = require('./expressionParser');

    var moOutput = "";
    var arrary_subscripts = content;
    moOutput+="["

    if (arrary_subscripts != null) {
        array_subscripts.forEach(array_subscript => {
            if (array_subscript.colon_op != null) {
                if (array_subscript.colon_op) {
                    moOutput+=":";
                }
            } else if (array_subscript.expression != null) {
                moOutput+=expressionParser.parser(array_subscript.expression);
            }
        });
    }
    moOutput+="] ";
    return moOutput;
}

module.exports = {parse};