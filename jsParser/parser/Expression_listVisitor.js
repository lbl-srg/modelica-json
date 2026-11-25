'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Expression_list = require('../domain/Expression_list')

const ExpressionVisitor = require('./ExpressionVisitor')

class Expression_listVisitor extends modelicaVisitor {
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

exports.Expression_listVisitor = Expression_listVisitor
