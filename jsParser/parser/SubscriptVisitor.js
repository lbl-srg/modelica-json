const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Subscript = require('../domain/Subscript');

const ExpressionVisitor = require('./ExpressionVisitor');

class SubscriptVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitSubscript(ctx) {
        var expression = null;
        var color_op = ctx.SYMBOL_COLON()? true: false;

        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            expression = expressionVisitor.visitExpression(ctx.expression());
        }
        return new Subscript.Subscript(expression, color_op);
    }
};

SubscriptVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitSubscript = this.visitSubscript;
exports.SubscriptVisitor = SubscriptVisitor;