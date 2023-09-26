const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Class_definition = require('../domain/Class_definition')

const Class_prefixesVisitor = require('./Class_prefixesVisitor')
const Class_specifierVisitor = require('./Class_specifierVisitor')

class Class_definitionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitClass_definition (ctx) {
    let encapsulated = false
    let class_prefixes = ''
    let class_specifier = null

    if (ctx.ENCAPSULATED()) {
      encapsulated = true
    }

    if (ctx.class_prefixes()) {
      const class_prefixesVisitor = new Class_prefixesVisitor.Class_prefixesVisitor()
      class_prefixes = class_prefixesVisitor.visitClass_prefixes(ctx.class_prefixes())
    }

    if (ctx.class_specifier()) {
      const class_specifierVisitor = new Class_specifierVisitor.Class_specifierVisitor()
      class_specifier = class_specifierVisitor.visitClass_specifier(ctx.class_specifier())
    }
    return new Class_definition.Class_definition(encapsulated, class_prefixes, class_specifier)
  }
};

Class_definitionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitClass_definition = this.visitClass_definition
exports.Class_definitionVisitor = Class_definitionVisitor
