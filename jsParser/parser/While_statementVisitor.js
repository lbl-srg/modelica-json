const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const While_statement = require('../domain/While_statement')

const StatementVisitor = require('./StatementVisitor')
const ExpressionVisitor = require('./ExpressionVisitor')

class While_statementVisitor extends modelicaVisitor {
  visitWhile_statement (ctx) {
    let expression = null
    const loop_statements = []

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      expression = expressionVisitor.visitExpression(ctx.expression())
    }

    if (ctx.statement()) {
      const statementVisitor = new StatementVisitor.StatementVisitor()
      ctx.statement().forEach(stmt => {
        loop_statements.push(statementVisitor.visitStatement(stmt))
      })
    }

    return new While_statement.While_statement(expression, loop_statements)
  }
};

exports.While_statementVisitor = While_statementVisitor
