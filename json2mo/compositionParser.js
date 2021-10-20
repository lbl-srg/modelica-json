function parse(content) {
    const element_listParser = require('./element_listParser');
    const element_sectionParser = require('./element_sectionParser');
    const external_compositionParser = require('./external_compositionParser');
    const annotationParser = require('./annotationParser');
    
    var moOutput = "";
    
    if (content.element_list != null) {
        moOutput+=element_listParser.parse(content.element_list);
    }
    if (content.element_sections != null) {
        var element_sections = content.element_sections;
        element_sections.forEach(element_section => {
            moOutput+=element_sectionParser.parse(element_section);
        });
    }
    if (content.external_composition != null) {
        console.log(content.external_composition)
        moOutput+=external_compositionParser.parse(content.external_composition);
    }
    if (content.annotation != null) {
        moOutput+=annotationParser.parse(content.annotation);
    }
    return moOutput;
}

module.exports = {parse};