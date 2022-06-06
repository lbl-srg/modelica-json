const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Relation = require('../domain/Relation');

const Arithmetic_expressionVisitor = require('./Arithmetic_exressionVisitor');
const Rel_opVisitor = require('./Rel_opVisitor');

class RelationVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitRelation(ctx) {
        var arithmetic_expression1 = null;
        var arithmetic_expression2 = null;
        var arithmetic_expressions = [];
        var rel_op = "";

        if (ctx.arithmetic_expression()) {
            var arithmetic_expressionVisitor = new Arithmetic_expressionVisitor.Arithmetic_expressionVisitor()
            ctx.arithmetic_expression().forEach(expr => {
                arithmetic_expressions.push(arithmetic_expressionVisitor.visitArithmetic_expression(expr));
            });
        }

        if (arithmetic_expressions.length > 0) {
            arithmetic_expression1 = arithmetic_expressions[0];
            if (arithmetic_expressions.length > 1) {
                arithmetic_expression2 = arithmetic_expressions[1];
            }
        }

        if (ctx.rel_op()) {
            var rel_opVisitor = new Rel_opVisitor.Rel_opVisitor();
            rel_op = rel_opVisitor.visitRel_op(ctx.rel_op());
        }
        
        return new Relation.Relation(arithmetic_expression1, rel_op, arithmetic_expression2);
    }
};

RelationVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitRelation = this.visitRelation;
exports.RelationVisitor = RelationVisitor;