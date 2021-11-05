function parse(content, rawJson=false) {
    const util = require('util');
    
    var moOutput = "";
    if (content!=null) {
        moOutput+=util.format("%s ", JSON.stringify(content));
    }
    return moOutput;
}

module.exports = {parse};