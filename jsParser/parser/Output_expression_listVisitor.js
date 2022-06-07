const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Output_expression_list = require('../domain/Output_expression_list');

const ExpressionVisitor = require('./ExpressionVisitor');

class Output_expression_listVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitOutput_expression_list(ctx) {
        var output_expressions = [];

        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            ctx.expression().forEach(expr => {
                output_expressions.push(expressionVisitor.visitExpression(expr));
            });
        }
        return new Output_expression_list.Output_expression_list(output_expressions);
    }
};

Output_expression_listVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitOutput_expression_list = this.visitOutput_expression_list;
exports.Output_expression_listVisitor = Output_expression_listVisitor;