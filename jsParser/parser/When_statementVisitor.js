const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const When_statement = require('../domain/When_statement')
const When_elsewhen_statement = require('../domain/When_elsewhen_statement')

const statementVisitor = require('./StatementVisitor')
const ExpressionVisitor = require('./ExpressionVisitor')

class When_statementVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitWhen_statement (ctx) {
    const when_elsewhen = []
    const expressions = []
    const statements = []

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      ctx.expression().forEach(expr => {
        expressions.push(expressionVisitor.visitExpression(expr))
      })
    }
    if (ctx.statement()) {
      var statementVisitor = new statementVisitor.statementVisitor()
      ctx.statement().forEach(eqn => {
        statements.push(statementVisitor.visitStatement(eqn))
      })
    }

    let i = 0
    let expression_idx = 0
    let statement_idx = 0

    while (i < ctx.getChildCount() && !ctx.getChild(i).getText().toLowerCase() == 'end') {
      if (ctx.getChild(i).getText().toLowerCase() == 'when' || ctx.getChild(i).getText().toLowerCase() == 'elsewhen') {
        const condition = expressions.get(expression_idx)
        expression_idx += 1
        const start_idx = i + 3 // start after then (when/elswhen[0] <expr>[1] then[2] <eqn>[3])
        let end_idx = start_idx
        for (let j = start_idx; j < ctx.getChildCount(); j++) {
          if (!ctx.getChild(j).getText() == ';' && !(ctx.getChild(j) instanceof modelicaParser.StatementContext)) {
            end_idx = j
            break
          }
        }

        const then = statements.slice(statement_idx, statement_idx + parseInt((end_idx - start_idx) / 2)) // why (end-start)/2?
        when_elsewhen.push(new When_elsewhen_statement.When_elsewhen_statement(condition, then))
        statement_idx = statement_idx + parseInt((end_idx - start_idx) / 2)
        i = end_idx
      } else {
        i = i + 1
      }
    }
    return new When_statement.When_statement(when_elsewhen)
  }
};

When_statementVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitWhen_statement = this.visitWhen_statement
exports.When_statementVisitor = When_statementVisitor
