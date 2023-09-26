const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Expression = require('../domain/Expression')
const If_expression = require('../domain/If_expression')
const If_elseif_expression = require('../domain/If_elseif_expression')

const Simple_expressionVisitor = require('./Simple_expressionVisitor')

class ExpressionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitExpression (ctx) {
    let simple_expression = null
    let if_expression = null
    const expressions = []
    const if_elseif = []

    if (ctx.simple_expression()) {
      const simple_expressionVisitor = new Simple_expressionVisitor.Simple_expressionVisitor()
      simple_expression = simple_expressionVisitor.visitSimple_expression(ctx.simple_expression())
    }

    if (ctx.expression()) {
      ctx.expression().forEach(expr => {
        expressions.push(this.visitExpression(expr))
      })
    }

    if (expressions.length > 0) {
      for (let i = 0; i < expressions.length - 1; i += 2) {
        const condition = expressions[i]
        const then = expressions[i + 1]
        if_elseif.push(new If_elseif_expression.If_elseif_expression(condition, then))
      }
      if (expressions.length > 2) {
        const else_expression = expressions[expressions.length - 1]
        if_expression = new If_expression.If_expression(if_elseif, else_expression)
      } else {
        if_expression = new If_expression.If_expression(if_elseif, null)
      }
    }

    return new Expression.Expression(simple_expression, if_expression)
  }
};

ExpressionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitExpression = this.visitExpression
exports.ExpressionVisitor = ExpressionVisitor
