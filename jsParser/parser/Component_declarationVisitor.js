const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Component_declaration = require('../domain/Component_declaration')

const DeclarationVisitor = require('./DeclarationVisitor')
const Condition_attributeVisitor = require('./Condition_attributeVisitor')
const CommentVisitor = require('./CommentVisitor')

class Component_declarationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitComponent_declaration (ctx) {
    let declaration = null
    let condition_attribute = null
    let comment = null

    if (ctx.declaration()) {
      const declarationVisitor = new DeclarationVisitor.DeclarationVisitor()
      declaration = declarationVisitor.visitDeclaration(ctx.declaration())
    }
    if (ctx.condition_attribute()) {
      const condition_attributeVisitor = new Condition_attributeVisitor.Condition_attributeVisitor()
      condition_attribute = condition_attributeVisitor.visitCondition_attribute(ctx.condition_attribute())
    }
    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }

    return new Component_declaration.Component_declaration(declaration, condition_attribute, comment)
  }
};

Component_declarationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitComponent_declaration = this.visitComponent_declaration
exports.Component_declarationVisitor = Component_declarationVisitor
