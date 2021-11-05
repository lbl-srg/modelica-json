function parse(content, rawJson=false) {
    const util = require('util');
    const expressionParser = require('./expressionParser');
    const for_indexParser = require('./for_indexParser'); //only for raw-json
    
    var moOutput = "";
    if (rawJson) {
        var indices = content.indices
        if (indices != null) {
            indices.forEach(for_index => {
                moOutput+=for_indexParser.parse(for_index, rawJson);
                moOutput+=",";
            });
            moOutput = moOutput.slice(0, -1);
        }
    } else {
        var indices = content;
        if (indices!=null) {
            indices.forEach(index => {
                if (index.identifier != null) {
                    moOutput+=util.format("%s ",index.identifier);
                }
                if (index.expression != null) {
                    moOutput+="in "
                    moOutput+=expressionParser.parse(index.expression, rawJson);
                }
                moOutput+=",";
            });
            moOutput=moOutput.slice(0, -1);
        }
    }    
    return moOutput;
}

module.exports = {parse};