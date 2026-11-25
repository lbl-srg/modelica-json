const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor

class Rel_opVisitor extends modelicaVisitor {
  visitRel_op (ctx) {
    const rel_op = ctx ? ctx.getText() : ''
    return rel_op
  }
};

exports.Rel_opVisitor = Rel_opVisitor
