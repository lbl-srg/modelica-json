const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Connect_clause = require('../domain/Connect_clause');

const Component_referenceVisitor = require('./Component_referenceVisitor');

class Connect_clauseVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitConnect_clause(ctx) {
        var from = null;
        var to = null;
        var comp_refs = [];

        if (ctx.component_reference()) {
            var component_referenceVisitor = new Component_referenceVisitor.Component_referenceVisitor();
            ctx.component_reference().forEach(comp_ref => {
                comp_refs.push(component_referenceVisitor.visitComponent_reference(comp_ref));
            });
        }

        if (comp_refs.length == 2) {
            from = comp_refs[0];
            to = comp_refs[1];
        }
        
        return new Connect_clause.Connect_clause(from, to);
    }
};

Connect_clauseVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitConnect_clause = this.visitConnect_clause;
exports.Connect_clauseVisitor = Connect_clauseVisitor;