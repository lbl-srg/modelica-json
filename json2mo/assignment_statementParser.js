function parse(content) {
    const component_referenceParser = require('./component_referenceParser');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    if (content.identifier != null) {
        moOutput+=component_referenceParser.parse(content.identifier)
    }
    moOutput+=":="
    if (content.value != null) {
        moOutput+=expressionParser.parse(content.value)
    }
    return moOutput;
}

module.exports = {parse};