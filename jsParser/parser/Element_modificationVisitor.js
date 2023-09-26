const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Element_modification = require('../domain/Element_modification')

const NameVisitor = require('./NameVisitor')
const ModificationVisitor = require('./ModificationVisitor')
const String_commentVisitor = require('./String_commentVisitor')

class Element_modificationVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitElement_modification (ctx) {
    let name = null
    let modification = null
    let string_comment = null

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      name = nameVisitor.visitName(ctx.name())
    }
    if (ctx.modification()) {
      const modificationVisitor = new ModificationVisitor.ModificationVisitor()
      modification = modificationVisitor.visitModification(ctx.modification())
    }
    if (ctx.string_comment()) {
      const string_commentVisitor = new String_commentVisitor.String_commentVisitor()
      string_comment = string_commentVisitor.visitString_comment(ctx.string_comment())
    }

    return new Element_modification.Element_modification(name, modification, string_comment)
  }
};

Element_modificationVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitElement_modification = this.visitElement_modification
exports.Element_modificationVisitor = Element_modificationVisitor
