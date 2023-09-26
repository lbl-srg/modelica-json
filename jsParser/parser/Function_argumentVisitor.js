const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Function_argument = require('../domain/Function_argument')

const NameVisitor = require('./NameVisitor')
const Named_argumentsVisitor = require('./Named_argumentsVisitor')
const ExpressionVisitor = require('./ExpressionVisitor')

class Function_argumentVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitFunction_argument (ctx) {
    let function_name = null
    let named_arguments = null
    let expression = null

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      function_name = nameVisitor.visitName(ctx.name())
    }
    if (ctx.named_arguments()) {
      const named_argumentsVisitor = new Named_argumentsVisitor.Named_argumentsVisitor()
      named_arguments = named_argumentsVisitor.visitNamed_arguments(ctx.named_arguments())
    }
    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      expression = expressionVisitor.visitExpression(ctx.expression())
    }

    return new Function_argument.Function_argument(function_name, named_arguments, expression)
  }
};

Function_argumentVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitFunction_argument = this.visitFunction_argument
exports.Function_argumentVisitor = Function_argumentVisitor
