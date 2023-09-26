const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Import_clause = require('../domain/Import_clause')

const NameVisitor = require('./NameVisitor')
const Import_listVisitor = require('./Import_listVisitor')
const CommentVisitor = require('./CommentVisitor')

class Import_clauseVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitImport_clause (ctx) {
    const identifier = ctx.IDENT() ? ctx.IDENT().getText() : ''
    let name = null
    const dot_star = !!ctx.IDENT()
    let import_list = null
    let comment = null

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      name = nameVisitor.visitName(ctx.name())
    }

    if (ctx.import_list()) {
      const import_listVisitor = new Import_listVisitor.Import_listVisitor()
      import_list = import_listVisitor.visitImport_list(ctx.import_list())
    }

    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }

    return new Import_clause.Import_clause(identifier, name, dot_star, import_list, comment)
  }
};

Import_clauseVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitImport_clause = this.visitImport_clause
exports.Import_clauseVisitor = Import_clauseVisitor
