const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const For_indices = require('../domain/For_indices')

const For_indexVisitor = require('./For_indexVisitor')

class For_indicesVisitor extends modelicaVisitor {
  visitFor_indices (ctx) {
    const indices = []

    if (ctx.for_index()) {
      const for_indexVisitor = new For_indexVisitor.For_indexVisitor()
      ctx.for_index().forEach(index => {
        indices.push(for_indexVisitor.visitFor_index(index))
      })
    }

    return new For_indices.For_indices(indices)
  }
};

exports.For_indicesVisitor = For_indicesVisitor
