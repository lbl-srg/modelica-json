function parse(content, rawJson=false) {
    const class_definitionParser = require('./class_definitionParser');
    const import_clauseParser = require('./import_clauseParser');
    const extends_clauseParser = require('./extends_clauseParser');
    const component_clauseParser = require('./component_clauseParser');
    const constraining_clauseParser = require('./constraining_clauseParser');
    const commentParser = require('./commentParser');
    
    var moOutput = "";
    if (content.import_clause != null) {
        moOutput+=import_clauseParser.parse(content.import_clause, rawJson);
    } else if (content.extends_clause != null) {
        moOutput+=extends_clauseParser.parse(content.extends_clause, rawJson);
    } else {
        if (content.redeclare != null) {
            if (content.redeclare) {
                moOutput+="redeclare "
            }
        }
        if (content.is_final != null) {
            if (content.is_final) {
                moOutput+="final "
            }
        }
        if (content.inner != null) {
            if (content.inner) {
                moOutput+="inner "
            }
        }
        if (content.outer != null) {
            if (content.outer) {
                moOutput+="outer "
            }
        }
        if (content.replaceable != null) {
            if (content.replaceable) {
                moOutput+="replaceable "
                if (content.class_definition != null) {
                    moOutput+=class_definitionParser.parse(content.class_definition, rawJson);
                } else if (content.component_clause != null) {
                    moOutput+=component_clauseParser.parse(content.component_clause, rawJson);
                }

                if (content.constraining_clause != null) {
                    moOutput+="\n"
                    moOutput+=constraining_clauseParser.parse(content.constraining_clause, rawJson);
                }

                if (content.comment != null) {
                    moOutput+=commentParser.parse(content.comment, rawJson);
                }
            } else {
                if (content.class_definition != null) {
                    moOutput+=class_definitionParser.parse(content.class_definition, rawJson);
                } else if (content.component_clause != null) {
                    moOutput+=component_clauseParser.parse(content.component_clause, rawJson);
                }
            }
        } else {
            if (content.class_definition != null) {
                moOutput+=class_definitionParser.parse(content.class_definition, rawJson);
            } else if (content.component_clause != null) {
                moOutput+=component_clauseParser.parse(content.component_clause, rawJson);
            }
        }
    }
    return moOutput;
}
module.exports = {parse};