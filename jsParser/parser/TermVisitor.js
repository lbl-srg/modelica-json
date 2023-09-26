const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Term = require('../domain/Term')

const FactorVisitor = require('./FactorVisitor')

class TermVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitTerm (ctx) {
    const mul_ops = []
    const factors = []

    if (ctx.mul_op()) {
      ctx.mul_op().forEach(mul => {
        mul_ops.push(mul.getText())
      })
    }

    if (ctx.factor()) {
      const factorVisitor = new FactorVisitor.FactorVisitor()
      ctx.factor().forEach(f => {
        factors.push(factorVisitor.visitFactor(f))
      })
    }

    return new Term.Term(factors, mul_ops)
  }
}

TermVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitTerm = this.visitTerm
exports.TermVisitor = TermVisitor
