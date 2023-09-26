const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Annotation = require('../domain/Annotation')

const Class_modificationVisitor = require('./Class_modificationVisitor')

class AnnotationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitAnnotation (ctx) {
    let class_modification = null

    if (ctx.class_modification()) {
      const class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor()
      class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification())
    }
    return new Annotation.Annotation(class_modification)
  }
};

AnnotationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitAnnotation = this.visitAnnotation
exports.AnnotationVisitor = AnnotationVisitor
