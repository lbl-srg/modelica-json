const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Condition_attribute = require('../domain/Condition_attribute')

const ExpressionVisitor = require('./ExpressionVisitor')

class Condition_attributeVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitCondition_attribute (ctx) {
    let expression = null

    if (ctx.expression()) {
      const expressionVisitor = new ExpressionVisitor.ExpressionVisitor()
      expression = expressionVisitor.visitExpression(ctx.expression())
    }

    return new Condition_attribute.Condition_attribute(expression)
  }
};

Condition_attributeVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitCondition_attribute = this.visitCondition_attribute
exports.Condition_attributeVisitor = Condition_attributeVisitor
