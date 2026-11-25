'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Declaration = require('../domain/Declaration')

const Array_subscriptsVisitor = require('./Array_subscriptsVisitor')
const ModificationVisitor = require('./ModificationVisitor')

class DeclarationVisitor extends modelicaVisitor {
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

exports.DeclarationVisitor = DeclarationVisitor
