'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Logical_factor = require('../domain/Logical_factor')

const RelationVisitor = require('./RelationVisitor')

class Logical_factorVisitor extends modelicaVisitor {
  visitLogical_factor (ctx) {
    const not = !!ctx.NOT()
    let relation = null

    if (ctx.relation()) {
      const relationVisitor = new RelationVisitor.RelationVisitor()
      relation = relationVisitor.visitRelation(ctx.relation())
    }

    return new Logical_factor.Logical_factor(not, relation)
  }
};

exports.Logical_factorVisitor = Logical_factorVisitor
