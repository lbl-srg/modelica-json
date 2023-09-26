const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const For_equation = require('../domain/For_equation')

const EquationVisitor = require('./EquationVisitor')
const For_indicesVisitor = require('./For_indicesVisitor')

class For_equationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitFor_equation (ctx) {
    let for_indices = null
    const loop_equations = []

    if (ctx.for_indices()) {
      const for_indicesVisitor = new For_indicesVisitor.For_indicesVisitor()
      for_indices = for_indicesVisitor.visitFor_indices(ctx.for_indices())
    }

    if (ctx.equation()) {
      const equationVisitor = new EquationVisitor.EquationVisitor()
      ctx.equation().forEach(eqn => {
        loop_equations.push(equationVisitor.visitEquation(eqn))
      })
    }

    return new For_equation.For_equation(for_indices, loop_equations)
  }
};

For_equationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitFor_equation = this.visitFor_equation
exports.For_equationVisitor = For_equationVisitor
