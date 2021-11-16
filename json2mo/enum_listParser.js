function parse(content, rawJson=false) {
    const enumeration_literalParser = require('./enumeration_literalParser');
    
    var moOutput = "";
    var enum_list = null;
    if (rawJson) {
        enumeration_literals = content.enumeration_literal    
    } else {
        enumeration_literals = content;
    }
    
    if (enumeration_literals != null) {
        enumeration_literals.forEach(enumeration_literal => {
            moOutput+=enumeration_literalParser.parse(enumeration_literal, rawJson);
            moOutput+=", ";
        });
    }
    moOutput = moOutput.slice(0, -2);
    return moOutput;
}

module.exports = {parse};