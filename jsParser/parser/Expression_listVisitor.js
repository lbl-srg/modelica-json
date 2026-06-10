const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Expression_list = require('../domain/Expression_list')

const ExpressionVisitor = require('./ExpressionVisitor')

class Expression_listVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitExpression_list (ctx) {
    const expressions = []

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      ctx.expression().forEach(expr => {
        expressions.push(expressionVisitor.visitExpression(expr))
      })
    }
    return new Expression_list.Expression_list(expressions)
  }
};

Expression_listVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.Expression_listVisitor = Expression_listVisitor
