const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Modification = require('../domain/Modification')

const Class_modificationVisitor = require('./Class_modificationVisitor')
const ExpressionVisitor = require('./ExpressionVisitor')

class ModificationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitModification (ctx) {
    let class_modification = null
    const equal = !!ctx.SYMBOL_EQUAL()
    const colon_equal = !!ctx.SYMBOL_COLONEQUAL()
    let expression = null

    if (ctx.class_modification()) {
      const class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor()
      class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification())
    }
    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      expression = expressionVisitor.visitExpression(ctx.expression())
    }

    return new Modification.Modification(class_modification, equal, colon_equal, expression)
  }
};

ModificationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitModification = this.visitModification
exports.ModificationVisitor = ModificationVisitor
