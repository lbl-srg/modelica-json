const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Logical_expression = require('../domain/Logical_expression');

const Logical_termVisitor = require('./Logical_termVisitor');

class Logical_expressionVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitLogical_expression(ctx) {
        var logical_term_list = [];

        if (ctx.logical_term()) {
            var logical_termVisitor = new Logical_termVisitor.Logical_termVisitor();
            ctx.logical_term().forEach(term => {
                logical_term_list.push(logical_termVisitor.visitLogical_term(term));
            });
        }
        
        return new Logical_expression.Logical_expression(logical_term_list);
    }
};

Logical_expressionVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitLogical_expression = this.visitLogical_expression;
exports.Logical_expressionVisitor = Logical_expressionVisitor;