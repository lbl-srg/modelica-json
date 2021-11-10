function parse(content, rawJson=false) {
    const expressionParser = require('./expressionParser');
    const subscriptParser = require('./subscriptParser');

    var moOutput = "";

    if (rawJson) {
        moOutput+="["
        var subscripts = content.subscripts;
        if (subscripts != null) {
            subscripts.forEach(subscript => {
                moOutput+=subscriptParser.parse(subscript, rawJson);
                moOutput+=","
            });
            moOutput = moOutput.slice(0, -2);
        }
        moOutput+="] "
    } else {
        var arrary_subscripts = content;
        moOutput+="["
    
        if (arrary_subscripts != null) {
            array_subscripts.forEach(array_subscript => {
                if (array_subscript.colon_op != null) {
                    if (array_subscript.colon_op) {
                        moOutput+=":";
                    }
                } else if (array_subscript.expression != null) {
                    moOutput+=expressionParser.parser(array_subscript.expression, rawJson);
                }
                moOutput+=", "
            });
            moOutput = moOutput.slice(0, -2);
        }
        moOutput+="] ";
    }    
    return moOutput;
}

module.exports = {parse};