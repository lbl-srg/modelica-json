const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Element_list = require('../domain/Element_list')

const ElementVisitor = require('./ElementVisitor')

class Element_listVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitElement_list (ctx) {
    const elements = []

    if (ctx.element()) {
      const elementVisitor = new ElementVisitor.ElementVisitor()
      ctx.element().forEach(element => {
        elements.push(elementVisitor.visitElement(element))
      })
    }

    return new Element_list.Element_list(elements)
  }
};

Element_listVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitElement_list = this.visitElement_list
exports.Element_listVisitor = Element_listVisitor
