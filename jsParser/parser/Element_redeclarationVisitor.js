const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Element_redeclaration = require('../domain/Element_redeclaration');

const Short_class_definitionVisitor = require('./Short_class_definitionVisitor');
const Component_clause1Visitor = require('./Component_clause1Visitor');
const Element_replaceableVisitor = require('./Element_replaceableVisitor');

class Element_redeclarationVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitElement_redeclaration(ctx) {
        var each = ctx.EACH()? true: false;
        var is_final = ctx.FINAL()? true: false;
        var short_class_definition = null;
        var component_clause1 = null;
        var element_replaceable = null;

        if (ctx.short_class_definition()) {
            var short_class_definitionVisitor = new Short_class_definitionVisitor.Short_class_definitionVisitor();
            short_class_definition = short_class_definitionVisitor.visitShort_class_definition(ctx.short_class_definition());
        }
        if (ctx.component_clause1()) {
            var component_clause1Visitor = new Component_clause1Visitor.Component_clause1Visitor();
            component_clause1 = component_clause1Visitor.visitComponent_clause1(ctx.component_clause1());
        }
        if (ctx.element_replaceable()) {
            var element_replaceableVisitor = new Element_replaceableVisitor.Element_replaceableVisitor();
            element_replaceable = element_replaceableVisitor.visitElement_replaceable(ctx.element_replaceable());
        }
        
        return new Element_redeclaration.Element_redeclaration(each, is_final, short_class_definition, component_clause1, element_replaceable);
    }
};

Element_redeclarationVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitElement_redeclaration = this.visitElement_redeclaration;
exports.Element_redeclarationVisitor = Element_redeclarationVisitor;