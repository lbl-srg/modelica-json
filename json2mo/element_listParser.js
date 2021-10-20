function parse(content) {
    const elementParser = require('./elementParser');
    
    var moOutput = "";
    var elements = content.elements
    if (elements != null) {
        elements.forEach(element => {
            moOutput+=elementParser.parse(element);
        });
    }
    return moOutput;
}

module.exports = {parse};