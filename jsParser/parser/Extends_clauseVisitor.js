const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Extends_clause = require('../domain/Extends_clause')

const NameVisitor = require('./NameVisitor')
const Class_modificationVisitor = require('./Class_modificationVisitor')
const AnnotationVisitor = require('./AnnotationVisitor')

class Extends_clauseVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitExtends_clause (ctx) {
    let name = null
    let class_modification = null
    let annotation = null

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      name = nameVisitor.visitName(ctx.name())
    }

    if (ctx.class_modification()) {
      const class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor()
      class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification())
    }

    if (ctx.annotation()) {
      const annotationVisitor = new AnnotationVisitor.AnnotationVisitor()
      annotation = annotationVisitor.visitAnnotation(ctx.annotation())
    }

    return new Extends_clause.Extends_clause(name, class_modification, annotation)
  }
};

Extends_clauseVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitExtends_clause = this.visitExtends_clause
exports.Extends_clauseVisitor = Extends_clauseVisitor
