function parse(content, rawJson=false) {
    const elementParser = require('./elementParser');

    var moOutput = "";
    if (rawJson) {
        var elements = content.elements
        if (elements != null) {
            elements.forEach(element => {
                moOutput+=elementParser.parse(element, rawJson);
            });
        }
    } else {
        var elements = content;
        if (elements != null) {
            elements.forEach(element => {
                moOutput+=elementParser.parse(element, rawJson);
            });
        }
    }
    
    return moOutput;
}

module.exports = {parse};