const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Primary = require('../domain/Primary')
const Function_call_primary = require('../domain/Function_call_primary')

const NameVisitor = require('./NameVisitor')
const Function_call_argsVisitor = require('./Function_call_argsVisitor')
const Expression_listVisitor = require('./Expression_listVisitor')
const Output_expression_listVisitor = require('./Output_expression_listVisitor')
const Function_argumentsVisitor = require('./Function_argumentsVisitor')
const Component_referenceVisitor = require('./Component_referenceVisitor')

class PrimaryVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitPrimary (ctx) {
    const unsigned_number = ctx.UNSIGNED_NUMBER() ? parseFloat(ctx.UNSIGNED_NUMBER().getText()) : null
    const primary_string = ctx.STRING() ? ctx.STRING().getText() : ''
    const is_false = !!ctx.FALSE()
    const is_true = !!ctx.TRUE()
    let function_name = null
    const der = !!ctx.DER()
    const initial = !!ctx.INITIAL()
    let function_call_args = null
    let function_call_primary = null
    let component_reference = null
    let output_expression_list = null
    const expression_lists = []
    let function_arguments = null
    const end = !!ctx.END()

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      function_name = nameVisitor.visitName(ctx.name())
    }
    if (ctx.function_call_args()) {
      const function_call_argsVisitor = new Function_call_argsVisitor.Function_call_argsVisitor()
      function_call_args = function_call_argsVisitor.visitFunction_call_args(ctx.function_call_args())
    }
    function_call_primary = new Function_call_primary.Function_call_primary(function_name, der, initial, function_call_args)

    if (ctx.component_reference()) {
      const component_referenceVisitor = new Component_referenceVisitor.Component_referenceVisitor()
      component_reference = component_referenceVisitor.visitComponent_reference(ctx.component_reference())
    }
    if (ctx.output_expression_list()) {
      const output_expression_listVisitor = new Output_expression_listVisitor.Output_expression_listVisitor()
      output_expression_list = output_expression_listVisitor.visitOutput_expression_list(ctx.output_expression_list())
    }
    if (ctx.expression_list()) {
      const expression_listVisitor = new Expression_listVisitor.Expression_listVisitor()
      ctx.expression_list().forEach(expr => {
        expression_lists.push(expression_listVisitor.visitExpression_list(expr))
      })
    }
    if (ctx.function_arguments()) {
      const function_argumentsVisitor = new Function_argumentsVisitor.Function_argumentsVisitor()
      function_arguments = function_argumentsVisitor.visitFunction_arguments(ctx.function_arguments())
    }
    return new Primary.Primary(unsigned_number, primary_string, is_false, is_true, function_call_primary, component_reference,
      output_expression_list, expression_lists, function_arguments, end)
  }
}

PrimaryVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitPrimary = this.visitPrimary
exports.PrimaryVisitor = PrimaryVisitor
