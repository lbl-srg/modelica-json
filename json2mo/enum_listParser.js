function parse(content) {
    const enumeration_literalParser = require('./enumeration_literalParser');
    
    var moOutput = "";
    var enum_list = content.enum_list
    if (enum_list != null) {
        enum_list.forEach(enumeration_literal => {
            moOutput+=enumeration_literalParser.parse(enumeration_literal);
            moOutput+=", ";
        });
    }
    moOutput = moOutput.slice(0, -2);
    return moOutput;
}

module.exports = {parse};