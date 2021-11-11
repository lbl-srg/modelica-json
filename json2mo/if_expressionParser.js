function parse(content, rawJson=false) {
    const if_elseif_expressionParser = require('./if_elseif_expressionParser');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    var if_elseifs = content.if_elseif
    if (if_elseifs != null) {
        if_elseifs.forEach(if_elseif_expression => {
            moOutput+="elseif "
            moOutput+=if_elseif_expressionParser.parse(if_elseif_expression, rawJson);
        });
    }
    moOutput = moOutput.slice(4, moOutput.length); //to remove 1st else of elseif so that we get "if"
    
    if (content.else_expression != null) {
        moOutput+="else \n";
        moOutput+=expressionParser.parse(content.else_expression, rawJson);
    }
    return moOutput;
}

module.exports = {parse};