const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Simple_expression = require('../domain/Simple_expression')

const Logical_expressionVisitor = require('./Logical_expressionVisitor')

class Simple_expressionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitSimple_expression (ctx) {
    const logical_expressions = []
    let logical_expression1 = null
    let logical_expression2 = null
    let logical_expression3 = null

    if (ctx.logical_expression()) {
      const logical_expressionVisitor = new Logical_expressionVisitor.Logical_expressionVisitor()
      ctx.logical_expression().forEach(expr => {
        logical_expressions.push(logical_expressionVisitor.visitLogical_expression(expr))
      })
    }

    if (logical_expressions.length > 0) {
      logical_expression1 = logical_expressions[0]

      if (logical_expressions.length > 1) {
        logical_expression2 = logical_expressions[1]
      }
      if (logical_expressions.length > 2) {
        logical_expression3 = logical_expressions[2]
      }
    }

    return new Simple_expression.Simple_expression(logical_expression1, logical_expression2, logical_expression3)
  }
};

Simple_expressionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitSimple_expression = this.visitSimple_expression
exports.Simple_expressionVisitor = Simple_expressionVisitor
