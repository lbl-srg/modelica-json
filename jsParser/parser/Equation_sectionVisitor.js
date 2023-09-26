const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Equation_section = require('../domain/Equation_section')

const EquationVisitor = require('./EquationVisitor')

class Equation_sectionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitEquation_section (ctx) {
    const initial = !!ctx.INITIAL()
    const equations = []

    if (ctx.equation()) {
      const equationVisitor = new EquationVisitor.EquationVisitor()
      ctx.equation().forEach(eqn => {
        equations.push(equationVisitor.visitEquation(eqn))
      })
    }

    return new Equation_section.Equation_section(initial, equations)
  }
};

Equation_sectionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitEquation_section = this.visitEquation_section
exports.Equation_sectionVisitor = Equation_sectionVisitor
