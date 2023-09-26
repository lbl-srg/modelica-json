const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Short_class_specifier = require('../domain/Short_class_specifier')
const Short_class_specifier_value = require('../domain/Short_class_specifier_value')

const Base_prefixVisitor = require('./Base_prefixVisitor')
const NameVisitor = require('./NameVisitor')
const Array_subscriptsVisitor = require('./Array_subscriptsVisitor')
const Class_modificationVisitor = require('./Class_modificationVisitor')
const CommentVisitor = require('./CommentVisitor')
const Enum_listVisitor = require('./Enum_listVisitor')

class Short_class_specifierVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitShort_class_specifier (ctx) {
    let identifier = ''
    var short_class_specifier_value = null
    if (ctx.IDENT()) {
      identifier = ctx.IDENT().getText()
    }

    let base_prefix = null
    let name = null
    let array_subscripts = null
    let class_modification = null
    let comment = null
    let enum_list = null

    if (ctx.base_prefix()) {
      const base_prefixVisitor = new Base_prefixVisitor.Base_prefixVisitor()
      base_prefix = base_prefixVisitor.visitBase_prefix(ctx.base_prefix())
    }
    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      name = nameVisitor.visitName(ctx.name())
    }
    if (ctx.array_subscripts()) {
      const array_subscriptsVisitor = new Array_subscriptsVisitor.Array_subscriptsVisitor()
      array_subscripts = array_subscriptsVisitor.visitArray_subscripts(ctx.array_subscripts())
    }
    if (ctx.class_modification()) {
      const class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor()
      class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification())
    }
    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }
    if (ctx.enum_list()) {
      const enum_listVisitor = new Enum_listVisitor.Enum_listVisitor()
      enum_list = enum_listVisitor.visitEnum_list(ctx.enum_list())
    }
    var short_class_specifier_value = new Short_class_specifier_value.Short_class_specifier_value(base_prefix, name, array_subscripts, class_modification, comment, enum_list)

    return new Short_class_specifier.Short_class_specifier(identifier, short_class_specifier_value)
  }
};

Short_class_specifierVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitShort_class_specifier = this.visitShort_class_specifier
exports.Short_class_specifierVisitor = Short_class_specifierVisitor
