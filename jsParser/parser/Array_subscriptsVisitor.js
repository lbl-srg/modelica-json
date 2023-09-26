const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Array_subscripts = require('../domain/Array_subscripts')

const SubscriptVisitor = require('./SubscriptVisitor')

class Array_subscriptsVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitArray_subscripts (ctx) {
    const subscripts = []

    if (ctx.subscript()) {
      const subscriptVisitor = new SubscriptVisitor.SubscriptVisitor()
      ctx.subscript().forEach(sub => {
        subscripts.push(subscriptVisitor.visitSubscript(sub))
      })
    }
    return new Array_subscripts.Array_subscripts(subscripts)
  }
};

Array_subscriptsVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitArray_subscripts = this.visitArray_subscripts
exports.Array_subscriptsVisitor = Array_subscriptsVisitor
