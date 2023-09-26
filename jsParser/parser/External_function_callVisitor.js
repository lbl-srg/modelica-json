const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const External_function_call = require('../domain/External_function_call')

const Component_referenceVisitor = require('./Component_referenceVisitor')
const Expression_listVisitor = require('./Expression_listVisitor')

class External_function_callVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitExternal_function_call (ctx) {
    let component_reference = null
    let identifier = ''
    let expression_list = null

    if (ctx.component_reference()) {
      const component_referenceVisitor = new Component_referenceVisitor.Component_referenceVisitor()
      component_reference = component_referenceVisitor.visitComponent_reference(ctx.component_reference())
    }

    if (ctx.IDENT()) {
      identifier = ctx.IDENT().getText()
    }

    if (ctx.expression_list()) {
      const expression_listVisitor = new Expression_listVisitor.Expression_listVisitor()
      expression_list = expression_listVisitor.visitExpression_list(ctx.expression_list())
    }

    return new External_function_call.External_function_call(component_reference, identifier, expression_list)
  }
};

External_function_callVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitEnum_list = this.visitEnum_list
exports.External_function_callVisitor = External_function_callVisitor
