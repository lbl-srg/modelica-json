'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Algorithm_section = require('../domain/Algorithm_section')

const StatementVisitor = require('./StatementVisitor')

class Algorithm_sectionVisitor extends modelicaVisitor {
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

exports.Algorithm_sectionVisitor = Algorithm_sectionVisitor
