const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Expression_list = require('../domain/Expression_list');

const ExpressionVisitor = require('./ExpressionVisitor');

class Expression_listVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitExpression_list(ctx) {
        var expressions = [];

        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            ctx.expression().forEach(expr => {
                expressions.push(expressionVisitor.visitExpression(expr));
            });
        }
        return new Expression_list.Expression_list(expressions);
    }
};

Expression_listVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitExpression_list = this.visitExpression_list;
exports.Expression_listVisitor = Expression_listVisitor;