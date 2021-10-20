function parse(content) {
    const util = require('util');
    const component_referenceParser = require('./component_referenceParser');

    var moOutput = "";
    moOutput+="connect(";
    if (content.from != null) {
        moOutput+=component_referenceParser.parse(content.from);
    }
    if (content.to != null) {
        moOutput+=", "
        moOutput+=component_referenceParser.parse(content.to);
    }
    moOutput+=")\n";
    return moOutput;
}

module.exports = {parse};