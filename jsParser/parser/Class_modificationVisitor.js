const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Class_modification = require('../domain/Class_modification')

const Argument_listVisitor = require('./Argument_listVisitor')

class Class_modificationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitClass_modification (ctx) {
    let argument_list = null

    if (ctx.argument_list()) {
      const argument_listVisitor = new Argument_listVisitor.Argument_listVisitor()
      argument_list = argument_listVisitor.visitArgument_list(ctx.argument_list())
    }

    return new Class_modification.Class_modification(argument_list)
  }
};

Class_modificationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitClass_modification = this.visitClass_modification
exports.Class_modificationVisitor = Class_modificationVisitor
