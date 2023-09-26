const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Element = require('../domain/Element')

const Import_clauseVisitor = require('./Import_clauseVisitor')
const Extends_clauseVisitor = require('./Extends_clauseVisitor')
const Constraining_clauseVisitor = require('./Constraining_clauseVisitor')
const Class_definitionVisitor = require('./Class_definitionVisitor')
const Component_clauseVisitor = require('./Component_clauseVisitor')
const CommentVisitor = require('./CommentVisitor')

class ElementVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitElement (ctx) {
    let import_clause = null
    let extends_clause = null
    let redeclare = false
    let is_final = false
    let inner = false
    let outer = false
    let replaceable = false
    let constraining_clause = null
    let class_definition = null
    let component_clause = null
    let comment = null

    if (ctx.import_clause()) {
      const import_clauseVisitor = new Import_clauseVisitor.Import_clauseVisitor()
      import_clause = import_clauseVisitor.visitImport_clause(ctx.import_clause())
    }
    if (ctx.extends_clause()) {
      const extends_clauseVisitor = new Extends_clauseVisitor.Extends_clauseVisitor()
      extends_clause = extends_clauseVisitor.visitExtends_clause(ctx.extends_clause())
    }

    redeclare = !!ctx.REDECLARE()
    is_final = !!ctx.FINAL()
    inner = !!ctx.INNER()
    outer = !!ctx.OUTER()
    replaceable = !!ctx.REPLACEABLE()

    if (ctx.constraining_clause()) {
      const constraining_clauseVisitor = new Constraining_clauseVisitor.Constraining_clauseVisitor()
      constraining_clause = constraining_clauseVisitor.visitConstraining_clause(ctx.constraining_clause())
    }
    if (ctx.class_definition()) {
      const class_definitionVisitor = new Class_definitionVisitor.Class_definitionVisitor()
      class_definition = class_definitionVisitor.visitClass_definition(ctx.class_definition())
    }
    if (ctx.component_clause()) {
      const component_clauseVisitor = new Component_clauseVisitor.Component_clauseVisitor()
      component_clause = component_clauseVisitor.visitComponent_clause(ctx.component_clause())
    }
    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }

    return new Element.Element(import_clause, extends_clause, redeclare, is_final, inner, outer,
      replaceable, constraining_clause, class_definition, component_clause, comment)
  }
};

ElementVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitElement = this.visitElement
exports.ElementVisitor = ElementVisitor
