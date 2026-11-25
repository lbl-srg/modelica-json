const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Enumeration_literal = require('../domain/Enumeration_literal')

const CommentVisitor = require('./CommentVisitor')

class Enumeration_literalVisitor extends modelicaVisitor {
  visitEnumeration_literal (ctx) {
    let identifier = ''
    let comment = null

    if (ctx.IDENT()) {
      identifier = ctx.IDENT().getText()
    }

    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }

    return new Enumeration_literal.Enumeration_literal(identifier, comment)
  }
};

exports.Enumeration_literalVisitor = Enumeration_literalVisitor
