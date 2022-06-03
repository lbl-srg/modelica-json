const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Component_clause1 = require('../domain/Component_clause1');

const Type_prefixVisitor = require('./Type_prefixVisitor');
const Type_specifierVisitor = require('./Type_specifierVisitor');
const Component_declaration1Visitor = require('./Component_declaration1Visitor');

class Component_clause1Visitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitComponent_clause1(ctx) {
        var type_prefix = null;
        var type_specifier = null;
        var component_declaration1 = null;

        if (ctx.type_prefix()) {
            var type_prefixVisitor = new Type_prefixVisitor.Type_prefixVisitor();
            type_prefix = type_prefixVisitor.visitType_prefix(ctx.type_prefix());
        }
        if (ctx.type_specifier()) {    
            const type_specifierVisitor = new Type_specifierVisitor.Type_specifierVisitor();
            type_specifier = type_specifierVisitor.visitType_specifier(ctx.type_specifier());
        }
        if (ctx.component_declaration1()) {
            var component_declaration1Visitor = new Component_declaration1Visitor.Component_declaration1Visitor();
            component_declaration1 = component_declaration1Visitor.visitComponent_declaration1(ctx.component_declaration1());
        }
        return new Component_clause1.Component_clause1(type_prefix, type_specifier, component_declaration1);
    }
};

Component_clause1Visitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitComponent_clause1 = this.visitComponent_clause1;
exports.Component_clause1Visitor = Component_clause1Visitor;