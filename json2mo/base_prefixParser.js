function parse(content, rawJson=false) {
    const util = require('util');
    var moOutput = "";
    if (rawJson) {
        if (content.type_prefix != null) {
            moOutput+=util.format("%s ", content.type_prefix);
        }    
    } else {
        var base_prefix = content;
        if (base_prefix != null) {
            moOutput+=util.format("%s ", base_prefix);
        }
    }
    
    return moOutput;
}

module.exports = {parse};