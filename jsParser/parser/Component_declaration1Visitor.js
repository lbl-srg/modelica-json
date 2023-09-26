const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Component_declaration1 = require('../domain/Component_declaration1')

const DeclarationVisitor = require('./DeclarationVisitor')
const CommentVisitor = require('./CommentVisitor')

class Component_declaration1Visitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitComponent_declaration1 (ctx) {
    let declaration = null
    let comment = null

    if (ctx.declaration()) {
      const declarationVisitor = new DeclarationVisitor.DeclarationVisitor()
      declaration = declarationVisitor.visitDeclaration(ctx.declaration())
    }
    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }

    return new Component_declaration1.Component_declaration1(declaration, comment)
  }
};

Component_declaration1Visitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitComponent_declaration = this.visitComponent_declaration
exports.Component_declaration1Visitor = Component_declaration1Visitor
