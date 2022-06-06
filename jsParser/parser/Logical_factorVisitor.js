const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Logical_factor = require('../domain/Logical_factor');

const RelationVisitor = require('./RelationVisitor');

class Logical_factorVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitLogical_factor(ctx) {
        var not = ctx.NOT()? true: false;
        var relation = null;

        if (ctx.relation()) {
            var relationVisitor = new RelationVisitor.RelationVisitor()
            relation = relationVisitor.visitRelation(ctx.relation());
        }
        
        return new Logical_factor.Logical_factor(not, relation);
    }
};

Logical_factorVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitLogical_factor = this.visitLogical_factor;
exports.Logical_factorVisitor = Logical_factorVisitor;