function parse(content, rawJson=false) {
    const util = require('util');
    const component_referenceParser = require('./component_referenceParser');

    var moOutput = "";
    moOutput+="connect(";
    if (content.from != null) {
        moOutput+=component_referenceParser.parse(content.from, rawJson);
    }
    if (content.to != null) {
        moOutput+=", "
        moOutput+=component_referenceParser.parse(content.to, rawJson);
    }
    moOutput+=")";
    return moOutput;
}

module.exports = {parse};