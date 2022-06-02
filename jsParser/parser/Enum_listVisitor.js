const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Enum_list = require('../domain/Enum_list');

const Enumeration_literalVisitor = require('./Enumeration_literalVisitor');

class Enum_listVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitEnum_list(ctx) {
        var enum_list = []

        if (ctx.enumeration_literal()) {
            var enumeration_literalVisitor = Enumeration_literalVisitor.Enumeration_literalVisitor();
            ctx.enumeration_literal().forEach(enumeration_literal => {
                enum_list.push(enumeration_literalVisitor.visitEnumeration_literal(enumeration_literal));
            });
        }

        return new Enum_list.Enum_list(enum_list);
    }
};

Enum_listVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitEnum_list = this.visitEnum_list;
exports.Enum_listVisitor = Enum_listVisitor;