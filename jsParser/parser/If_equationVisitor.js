const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const { TerminalNode } = require('antlr4/tree/Tree')
const If_equation = require('../domain/If_equation')
const If_elseif_equation = require('../domain/If_elseif_equation')

const EquationVisitor = require('./EquationVisitor')
const ExpressionVisitor = require('./ExpressionVisitor')
const { modelicaParser } = require('../antlrFiles/modelicaParser')

class If_equationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitIf_equation (ctx) {
    const if_elseif = []
    let else_equation = []
    const expressions = []
    const equations = []

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      ctx.expression().forEach(exp => {
        expressions.push(expressionVisitor.visitExpression(exp))
      })
    }
    if (ctx.equation()) {
      const equationVisitor = new EquationVisitor.EquationVisitor()
      ctx.equation().forEach(eqn => {
        equations.push(equationVisitor.visitEquation(eqn))
      })
    }

    let i = 0
    let expression_idx = 0
    let equation_idx = 0

    while (i < ctx.getChildCount() && !ctx.getChild(i).getText().toLowerCase() == 'end') {
      if (ctx.getChild(i).getText().toLowerCase() == 'if' || ctx.getChild(i).getText().toLowerCase() == 'elseif') {
        const condition = expressions.get(expression_idx)
        expression_idx += 1
        const start_idx = i + 3
        let end_idx = start_idx
        for (let j = start_idx; j < ctx.getChildCount(); j++) {
          if (!ctx.getChild(j).getText() == ';' && !(ctx.getChild(j) instanceof modelicaParser.EquationContext)) {
            end_idx = j
            break
          }
        }

        const then = equations.slice(equation_idx, equation_idx + parseInt((end_idx - start_idx) / 2))
        if_elseif.push(new If_elseif_equation.If_elseif_equation(condition, then))
        equation_idx = equation_idx + parseInt((end_idx - start_idx) / 2)
        i = end_idx
      } else if (ctx.getChild(i).getText().toLowerCase() == 'else') {
        const start_idx = i + 1
        let end_idx = start_idx
        for (let j = start_idx; j < ctx.getChildCount(); j++) {
          if (!ctx.getChild(j).getText() == ';' && !(ctx.getChild(j) instanceof modelicaParser.EquationContext)) {
            end_idx = j
            break
          }
        }
        else_equation = equations.slice(equation_idx, equation_idx + parseInt((end_idx - start_idx) / 2))
        equation_idx = equation_idx + parseInt((end_idx - start_idx) / 2)
        i = end_idx
      } else {
        i += 1
      }
    }
    return new If_equation.If_equation(if_elseif, else_equation)
  }
};

If_equationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitIf_equation = this.visitIf_equation
exports.If_equationVisitor = If_equationVisitor
