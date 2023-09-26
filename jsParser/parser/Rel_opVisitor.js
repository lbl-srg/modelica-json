const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor

class Rel_opVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitRel_op (ctx) {
    const rel_op = ctx ? ctx.getText() : ''
    return rel_op
  }
};

Rel_opVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitRel_op = this.visitRel_op
exports.Rel_opVisitor = Rel_opVisitor
