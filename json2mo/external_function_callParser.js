function parse(content) {
    const util = require('util');
    const component_referenceParser = require('./component_referenceParser');
    const expression_listParser = require('./expression_listParser');
    
    var moOutput = "";

    if (content.component_reference != null) {
        moOutput+=component_referenceParser.parse(contnnt.component_reference);
        moOutput+="= ";
    }
    if (content.identifier != null) {
        moOutput+="identifier ("
    }
    if (content.expression_list != null) {
        moOutput+=expression_listParser.parse(content.expression_list);
    }
    moOutput+=")\n";
    return moOutput;
}

module.exports = {parse};