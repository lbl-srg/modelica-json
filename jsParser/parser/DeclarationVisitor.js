const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Declaration = require('../domain/Declaration')

const Array_subscriptsVisitor = require('./Array_subscriptsVisitor')
const ModificationVisitor = require('./ModificationVisitor')

class DeclarationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitDeclaration (ctx) {
    const identifier = ctx.IDENT() ? ctx.IDENT().getText() : ''
    let array_subscripts = null
    let modification = null

    if (ctx.array_subscripts()) {
      const array_subscriptsVisitor = new Array_subscriptsVisitor.Array_subscriptsVisitor()
      array_subscripts = array_subscriptsVisitor.visitArray_subscripts(ctx.array_subscripts())
    }
    if (ctx.modification()) {
      const modificationVisitor = new ModificationVisitor.ModificationVisitor()
      modification = modificationVisitor.visitModification(ctx.modification())
    }

    return new Declaration.Declaration(identifier, array_subscripts, modification)
  }
};

DeclarationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitDeclaration = this.visitDeclaration
exports.DeclarationVisitor = DeclarationVisitor
