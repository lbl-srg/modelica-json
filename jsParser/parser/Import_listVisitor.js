const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Import_list = require('../domain/Import_list')

class Import_listVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitImport_list (ctx) {
    const identifier_list = []

    if (ctx.IDENT()) {
      ctx.IDENT().forEach(identifier => {
        identifier_list.push(identifier)
      })
    }

    return new Import_list.Import_list(identifier_list)
  }
};

Import_listVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitImport_list = this.visitImport_list
exports.Import_listVisitor = Import_listVisitor
