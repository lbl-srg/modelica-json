const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const { TerminalNode } = require('antlr4/tree/Tree')
const If_statement = require('../domain/If_statement')
const If_elseif_statement = require('../domain/If_elseif_statement')

const StatementVisitor = require('./StatementVisitor')
const ExpressionVisitor = require('./ExpressionVisitor')
const { modelicaParser } = require('../antlrFiles/modelicaParser')

class If_statementVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitIf_statement (ctx) {
    const if_elseif = []
    let else_statement = []
    const expressions = []
    const statements = []

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      ctx.expression().forEach(exp => {
        expressions.push(expressionVisitor.visitExpression(exp))
      })
    }
    if (ctx.statement()) {
      const statementVisitor = new StatementVisitor.StatementVisitor()
      ctx.statement().forEach(stmt => {
        statements.push(statementVisitor.visitStatement(stmt))
      })
    }

    let i = 0
    let expression_idx = 0
    let statement_idx =
         0

    while (i < ctx.getChildCount() && !ctx.getChild(i).getText().toLowerCase() == 'end') {
      if (ctx.getChild(i).getText().toLowerCase() == 'if' || ctx.getChild(i).getText().toLowerCase() == 'elseif') {
        const condition = expressions.get(expression_idx)
        expression_idx += 1
        const start_idx = i + 3
        let end_idx = start_idx
        for (let j = start_idx; j < ctx.getChildCount(); j++) {
          if (!ctx.getChild(j).getText() == ';' && !(ctx.getChild(j) instanceof modelicaParser.StatementContext)) {
            end_idx = j
            break
          }
        }

        const then = statements.slice(statement_idx, statement_idx + parseInt((end_idx - start_idx) / 2))
        if_elseif.push(new If_elseif_statement.If_elseif_statement(condition, then))
        statement_idx = statement_idx + parseInt((end_idx - start_idx) / 2)
        i = end_idx
      } else if (ctx.getChild(i).getText().toLowerCase() == 'else') {
        const start_idx = i + 1
        let end_idx = start_idx
        for (let j = start_idx; j < ctx.getChildCount(); j++) {
          if (!ctx.getChild(j).getText() == ';' && !(ctx.getChild(j) instanceof modelicaParser.StatementContext)) {
            end_idx = j
            break
          }
        }
        else_statement = statements.slice(statement_idx, statement_idx + parseInt((end_idx - start_idx) / 2))
        statement_idx = statement_idx + parseInt((end_idx - start_idx) / 2)
        i = end_idx
      } else {
        i += 1
      }
    }
    return new If_statement.If_statement(if_elseif, else_statement)
  }
};

If_statementVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitIf_statement = this.visitIf_statement
exports.If_statementVisitor = If_statementVisitor
