const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Modification = require('../domain/Modification');

const Class_modificationVisitor = require('./Class_modificationVisitor');
const ExpressionVisitor = require('./ExpressionVisitor');

class ModificationVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitModification(ctx) {
        var class_modification = null;
        var equal = ctx.SYMBOL_EQUAL() ? true : false;
        var colon_equal = ctx.SYMBOL_COLONEQUAL() ? true: false;
        var expression = null;

        if (ctx.class_modification()) {
            var class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor();
            class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification());
        }
        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            expression = expressionVisitor.visitExpression(ctx.expression());
        }
        
        return new Modification.Modification(class_modification, equal, colon_equal, expression);
    }
};

ModificationVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitModification = this.visitModification;
exports.ModificationVisitor = ModificationVisitor;