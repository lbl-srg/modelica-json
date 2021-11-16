function parse(content, rawJson=false) {
    const component_referenceParser = require('./component_referenceParser');
    const expressionParser = require('./expressionParser');
    
    var moOutput = "";
    if (content.identifier != null) {
        moOutput+=component_referenceParser.parse(content.identifier, rawJson)
    }
    moOutput+=":="
    if (content.value != null) {
        moOutput+=expressionParser.parse(content.value, rawJson)
    }
    return moOutput;
}

module.exports = {parse};