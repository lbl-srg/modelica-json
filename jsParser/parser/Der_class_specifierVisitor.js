const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Der_class_specifier = require('../domain/Der_class_specifier')
const Der_class_specifier_value = require('../domain/Der_class_specifier_value')

const NameVisitor = require('./NameVisitor')
// const CommentVisitor = require('./CommentVisitor');

class Der_class_specifierVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitDer_class_specifier (ctx) {
    let identifier = ''
    var der_class_specifier_value = null
    if (ctx.IDENT()) {
      identifier = ctx.IDENT(0).getText()
    }

    let type_specifier = null
    let identifiers = []
    let comment = null

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      type_specifier = nameVisitor.visitName(ctx.name())
    }
    if (ctx.IDENT().length > 1) {
      ctx.IDENT().forEach(ident => {
        identifiers.push(ident.getText())
      })
      identifiers = identifiers.slice(1)
    }
    if (ctx.comment()) {
      const commentVisitor = new CommentVisitor.CommentVisitor()
      comment = commentVisitor.visitComment(ctx.comment())
    }
    var der_class_specifier_value = new Der_class_specifier_value.Der_class_specifier_value(type_specifier, identifiers, comment)

    return new Der_class_specifier.Der_class_specifier(identifier, der_class_specifier_value)
  }
};

Der_class_specifierVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitDer_class_specifier = this.visitDer_class_specifier
exports.Der_class_specifierVisitor = Der_class_specifierVisitor
