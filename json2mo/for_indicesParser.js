function parse(content) {
    const util = require('util');
    const expressionParser = require('./expressionParser');
    // const for_indexParser = require('./for_indexParser'); //only for raw-json
    
    var moOutput = "";
    var indices = content; //if raw-json, then use content.indices
    if (indices!=null) {
        indices.forEach(index => {
            if (index.identifier != null) {
                moOutput+=util.format("%s ",index.identifier);
            }
            if (index.expression != null) {
                moOutput+="in "
                moOutput+=expressionParser.parse(index.expression);
            }
            moOutput+=",";
        });
        moOutput=moOutput.slice(0, -1);
    }
    
    return moOutput;
}

module.exports = {parse};