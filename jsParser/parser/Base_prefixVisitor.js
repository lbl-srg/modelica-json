'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Base_prefix = require('../domain/Base_prefix')

const Type_prefixVisitor = require('./Type_prefixVisitor')

class Base_prefixVisitor extends modelicaVisitor {
  visitBase_prefix (ctx) {
    let type_prefix = ''

    if (ctx.type_prefix()) {
      const type_prefixVisitor = new Type_prefixVisitor.Type_prefixVisitor()
      type_prefix = type_prefixVisitor.visitType_prefix(ctx.type_prefix())
    }

    return new Base_prefix.Base_prefix(type_prefix)
  }
};

exports.Base_prefixVisitor = Base_prefixVisitor
