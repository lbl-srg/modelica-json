const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Element_list = require('../domain/Element_list')

const ElementVisitor = require('./ElementVisitor')

class Element_listVisitor extends modelicaVisitor {
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

exports.Element_listVisitor = Element_listVisitor
