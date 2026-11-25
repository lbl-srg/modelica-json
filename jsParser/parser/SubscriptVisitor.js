const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Subscript = require('../domain/Subscript')

const ExpressionVisitor = require('./ExpressionVisitor')

class SubscriptVisitor extends modelicaVisitor {
  visitSubscript (ctx) {
    let expression = null
    const color_op = !!ctx.SYMBOL_COLON()

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      expression = expressionVisitor.visitExpression(ctx.expression())
    }
    return new Subscript.Subscript(expression, color_op)
  }
};

exports.SubscriptVisitor = SubscriptVisitor
