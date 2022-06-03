const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Component_clause = require('../domain/Component_clause');

const Type_prefixVisitor = require('./Type_prefixVisitor');
const Type_specifierVisitor = require('./Type_specifierVisitor');
const Array_subscriptsVisitor = require('./Array_subscriptsVisitor');
const Component_listVisitor = require('./Component_listVisitor');

class Component_clauseVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitComponent_clause(ctx) {
        var type_prefix = null;
        var type_specifier = null;
        var array_subscripts = null;
        var component_list = null;

        if (ctx.type_prefix()) {
            var type_prefixVisitor = new Type_prefixVisitor.Type_prefixVisitor();
            type_prefix = type_prefixVisitor.visitType_prefix(ctx.type_prefix());
        }
        if (ctx.type_specifier()) {    
            const type_specifierVisitor = new Type_specifierVisitor.Type_specifierVisitor();
            type_specifier = type_specifierVisitor.visitType_specifier(ctx.type_specifier());
        }
        if (ctx.array_subscripts()) {
            var array_subscriptsVisitor = new Array_subscriptsVisitor.Array_subscriptsVisitor();
            array_subscripts = array_subscriptsVisitor.visitArray_subscripts(ctx.array_subscripts());
        }
        if (ctx.component_list()) {
            var component_listVisitor = new Component_listVisitor.Component_listVisitor();
            component_list = component_listVisitor.visitComponent_listVisitor(ctx.component_list());
        }
        return new Component_clause.Component_clause(type_prefix, type_specifier, 
            array_subscripts, component_list);
    }
};

Component_clauseVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitComponent_clause = this.visitComponent_clause;
exports.Component_clauseVisitor = Component_clauseVisitor;

