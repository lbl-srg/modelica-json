function parse(content, rawJson=false) {
    const named_argumentParser = require('./named_argumentParser');
        
    var moOutput = "";

    if (rawJson) {
        if (content.named_argument != null) { 
            moOutput+=named_argumentParser.parse(content.named_argument, rawJson);
        }
        if (content.named_arguments != null) {
            moOutput+=","
            moOutput+=this.parse(content.named_arguments, rawJson);
        }
    }

    return moOutput;
}

module.exports = {parse};