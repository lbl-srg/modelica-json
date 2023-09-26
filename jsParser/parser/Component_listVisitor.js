const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Component_list = require('../domain/Component_list')

const Component_declarationVisitor = require('./Component_declarationVisitor')

class Component_listVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitComponent_list (ctx) {
    const component_declaration_list = []

    if (ctx.component_declaration()) {
      const component_declarationVisitor = new Component_declarationVisitor.Component_declarationVisitor()
      ctx.component_declaration().forEach(component_dec => {
        component_declaration_list.push(component_declarationVisitor.visitComponent_declaration(component_dec))
      })
    }

    return new Component_list.Component_list(component_declaration_list)
  }
};

Component_listVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitComponent_list = this.visitComponent_list
exports.Component_listVisitor = Component_listVisitor
