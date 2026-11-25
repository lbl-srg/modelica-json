const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const For_index = require('../domain/For_index')

const ExpressionVisitor = require('./ExpressionVisitor')

class For_indexVisitor extends modelicaVisitor {
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

exports.For_indexVisitor = For_indexVisitor
