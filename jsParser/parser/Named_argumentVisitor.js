const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Named_argument = require('../domain/Named_argument')

const Function_argumentVisitor = require('./Function_argumentVisitor')

class Named_argumentVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitNamed_argument (ctx) {
    const identifier = ctx.IDENT() ? ctx.IDENT().getText() : ''
    let value = null

    if (ctx.function_argument()) {
      const function_argumentVisitor = new Function_argumentVisitor.Function_argumentVisitor()
      value = function_argumentVisitor.visitFunction_argument(ctx.function_argument())
    }

    return new Named_argument.Named_argument(identifier, value)
  }
};

Named_argumentVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitNamed_argument = this.visitNamed_argument
exports.Named_argumentVisitor = Named_argumentVisitor
