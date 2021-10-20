function parse(content) {
    const element_listParser = require('./element_listParser');
    const equation_sectionParser = require('./equation_sectionParser');
    const algorithm_sectionParser = require('./algorithm_sectionParser');
    
    var moOutput = "";

    if (content.public_element_list != null) {
        moOutput+="public\n"
        moOutput+=element_listParser.parse(content.public_element_list);
    } else if (content.protected_element_list != null) {
        moOutput+="protected\n"
        moOutput+=element_listParser.parse(content.protected_element_list);
    }
    else if (content.equation_section != null) {
        moOutput+=equation_sectionParser.parse(content.equation_section);
    }
    else if (content.algorithm_section != null) {
        moOutput+=algorithm_sectionParser.parse(content.algorithm_section);
    }
    return moOutput;
}

module.exports = {parse};