const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Class_specifier = require('../domain/Class_specifier')

const Long_class_specifierVisitor = require('./Long_class_specifierVisitor')
const Short_class_specifierVisitor = require('./Short_class_specifierVisitor')
const Der_class_specifierVisitor = require('./Der_class_specifierVisitor')

class Class_specifierVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitClass_specifier (ctx) {
    let long_class_specifier = null
    let short_class_specifier = null
    let der_class_specifier = null

    if (ctx.long_class_specifier()) {
      const long_class_specifierVisitor = new Long_class_specifierVisitor.Long_class_specifierVisitor()
      long_class_specifier = long_class_specifierVisitor.visitLong_class_specifier(ctx.long_class_specifier())
    } else if (ctx.short_class_specifier()) {
      const short_class_specifierVisitor = new Short_class_specifierVisitor.Short_class_specifierVisitor()
      short_class_specifier = short_class_specifierVisitor.visitShort_class_specifier(ctx.short_class_specifier())
    } else if (ctx.der_class_specifier()) {
      const der_class_specifierVisitor = new Der_class_specifierVisitor.Der_class_specifierVisitor()
      der_class_specifier = der_class_specifierVisitor.visitDer_class_specifier(ctx.der_class_specifier())
    }

    return new Class_specifier.Class_specifier(long_class_specifier, short_class_specifier, der_class_specifier)
  }
};

Class_specifierVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitClass_specifier = this.visitClass_specifier
exports.Class_specifierVisitor = Class_specifierVisitor
