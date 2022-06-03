const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Element_replaceable = require('../domain/Element_replaceable');

const Short_class_definitionVisitor = require('./Short_class_definitionVisitor');
const Component_clause1Visitor = require('./Component_clause1Visitor');
const Constraining_clauseVisitor = require('./Constraining_clauseVisitor');

class Element_replaceableVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitElement_replaceable(ctx) {
        var short_class_definition = null;
        var component_clause1 = null;
        var constraining_clause = null;

        if (ctx.short_class_definition()) {
            var short_class_definitionVisitor = new Short_class_definitionVisitor.Short_class_definitionVisitor();
            short_class_definition = short_class_definitionVisitor.visitShort_class_definition(ctx.short_class_definition());
        }
        if (ctx.component_clause1()) {
            var component_clause1Visitor = new Component_clause1Visitor.Component_clause1Visitor();
            component_clause1 = component_clause1Visitor.visitComponent_clause1(ctx.component_clause1());
        }
        if (ctx.constraining_clause()) {
            var constraining_clauseVisitor = new Constraining_clauseVisitor.Constraining_clauseVisitor();
            constraining_clause = constraining_clauseVisitor.visitConstraining_clause(ctx.constraining_clause());
        }
        
        return new Element_replaceable.Element_replaceable(short_class_definition, component_clause1, constraining_clause);
    }
};

Element_replaceableVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitElement_replaceable = this.visitElement_replaceable;
exports.Element_replaceableVisitor = Element_replaceableVisitor;