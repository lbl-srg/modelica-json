const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Logical_term = require('../domain/Logical_term');

const Logical_factorVisitor = require('./Logical_factorVisitor');


class Logical_termVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitLogical_term(ctx) {
        var logical_factor_list = [];

        if (ctx.logical_factor()) {    
            var logical_factorVisitor = new Logical_factorVisitor.Logical_factorVisitor();
            ctx.logical_factor().forEach(factor=> {
                logical_factor_list.push(logical_factorVisitor.visitLogical_factor(factor));
            });
        }
        
        return new Logical_term.Logical_term(logical_factor_list);
    }
};

Logical_termVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitLogical_term = this.visitLogical_term;
exports.Logical_termVisitor = Logical_termVisitor;