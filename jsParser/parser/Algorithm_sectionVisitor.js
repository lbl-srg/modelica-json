const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Algorithm_section = require('../domain/Algorithm_section')

const StatementVisitor = require('./StatementVisitor')

class Algorithm_sectionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitAlgorithm_section (ctx) {
    const initial = !!ctx.INITIAL()
    const statements = []

    if (ctx.statement()) {
      const statementVisitor = new StatementVisitor.StatementVisitor()
      ctx.statement().forEach(stmt => {
        statements.push(statementVisitor.visitStatement(stmt))
      })
    }

    return new Algorithm_section.Algorithm_section(initial, statements)
  }
};

Algorithm_sectionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitAlgorithm_section = this.visitAlgorithm_section
exports.Algorithm_sectionVisitor = Algorithm_sectionVisitor
