const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Arithmetic_expression = require('../domain/Arithmetic_expression')
const Arithmetic_term = require('../domain/Arithmetic_term')

const TermVisitor = require('./TermVisitor')

class Arithmetic_expressionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitArithmetic_expression (ctx) {
    const add_ops = []
    const terms = []
    const arithmetic_term_list = []

    if (ctx.add_op()) {
      ctx.add_op().forEach(add => {
        add_ops.push(add.getText())
      })
    }

    if (ctx.term()) {
      const termVisitor = new TermVisitor.TermVisitor()
      ctx.term().forEach(t => {
        terms.push(termVisitor.visitTerm(t))
      })
    }
    if (terms.length > 0) {
      let extra_term = 0
      if (add_ops.length == (terms.length - 1)) {
        arithmetic_term_list.push(new Arithmetic_term.Arithmetic_term(null, terms[0]))
        extra_term = 1
      }
      for (let i = 0; i < add_ops.length; i++) {
        arithmetic_term_list.push(new Arithmetic_term.Arithmetic_term(add_ops[i], terms[extra_term + i]))
      }
    }

    return new Arithmetic_expression.Arithmetic_expression(arithmetic_term_list)
  }
}

Arithmetic_expressionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitArithmetic_expression = this.visitArithmetic_expression
exports.Arithmetic_expressionVisitor = Arithmetic_expressionVisitor
