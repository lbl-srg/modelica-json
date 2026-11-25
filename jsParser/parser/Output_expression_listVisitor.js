const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Output_expression_list = require('../domain/Output_expression_list')

const ExpressionVisitor = require('./ExpressionVisitor')

class Output_expression_listVisitor extends modelicaVisitor {
  visitOutput_expression_list (ctx) {
    const output_expressions = []

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      ctx.expression().forEach(expr => {
        output_expressions.push(expressionVisitor.visitExpression(expr))
      })
    }
    return new Output_expression_list.Output_expression_list(output_expressions)
  }
};

exports.Output_expression_listVisitor = Output_expression_listVisitor
