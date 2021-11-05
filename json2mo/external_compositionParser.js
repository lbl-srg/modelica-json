function parse(content, rawJson=false) {
    const util = require('util');
    const external_function_callParser = require('./external_function_callParser');
    const annotationParser = require('./annotationParser');
    
    var moOutput = "";
    moOutput+="external "
    if (content.language_specification != null) {
        moOutput+=util.format("%s ", content.language_specification);
    }
    if (content.external_function_call != null) {
        moOutput+=external_function_callParser.parse(content.external_function_call, rawJson);
    }
    if (content.external_annotation != null) {
        moOutput+=annotationParser.parse(content.external_annotation, rawJson);
    }
    moOutput+=";\n";
    return moOutput;
}

module.exports = {parse};