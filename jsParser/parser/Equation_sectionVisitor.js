'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Equation_section = require('../domain/Equation_section')

const EquationVisitor = require('./EquationVisitor')

class Equation_sectionVisitor extends modelicaVisitor {
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

exports.Equation_sectionVisitor = Equation_sectionVisitor
