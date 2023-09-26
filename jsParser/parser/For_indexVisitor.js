const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const For_index = require('../domain/For_index')

const ExpressionVisitor = require('./ExpressionVisitor')

class For_indexVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitFor_index (ctx) {
    const identifier = ctx.IDENT() ? ctx.IDENT().getText() : ''
    let expression = null

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      expression = expressionVisitor.visitExpression(ctx.expression())
    }

    return new For_index.For_index(identifier, expression)
  }
};

For_indexVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitFor_index = this.visitFor_index
exports.For_indexVisitor = For_indexVisitor
