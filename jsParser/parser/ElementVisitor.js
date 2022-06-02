const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Element = require('../domain/Element');

const Import_clauseVisitor = require('./Import_clauseVisitor');
const Extends_clauseVisitor = require('./Extends_clauseVisitor');
const Constraining_clauseVisitor = require('./Constraining_clauseVisitor');
const Class_definitionVisitor = require('./Class_definitionVisitor');
const Component_clauseVisitor = require('./Component_clauseVisitor');
const CommentVisitor = require('./CommentVisitor');

class ElementVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitElement(ctx) {
        var import_clause = null;
        var extends_clause = null;
        var redeclare = false;
        var is_final = false;
        var inner = false;
        var outer = false;
        var replaceable = false;
        var constraining_clause = null;
        var class_definition = null;
        var component_clause = null;
        var comment = null;

        if (ctx.import_clause()) {
            var import_clauseVisitor = new Import_clauseVisitor.Import_clauseVisitor();
            import_clause = import_clauseVisitor.visitImport_clause(ctx.import_clause());
        }
        if (ctx.extends_clause()) {
            var extends_clauseVisitor = new Extends_clauseVisitor.Extends_clauseVisitor();
            extends_clause = extends_clauseVisitor.visitExtends_clause(ctx.extends_clause());
        }

        redeclare = ctx.REDECLARE() ? true: false;
        is_final = ctx.FINAL() ? true: false;
        inner = ctx.INNER() ? true: false;
        outer = ctx.OUTER() ? true: false;
        replaceable = ctx.REPLACEABLE() ? true: false;

        if (ctx.constraining_clause()) {
            var constraining_clauseVisitor = new Constraining_clauseVisitor.Constraining_clauseVisitor();
            constraining_clause = constraining_clauseVisitor.visitConstraining_clause(ctx.constraining_clause());
        }
        if (ctx.class_definition()) {
            var class_definitionVisitor = new Class_definitionVisitor.Class_definitionVisitor();
            class_definition = class_definitionVisitor.visitClass_definition(ctx.class_definition());
        }
        if (ctx.component_clause()) {
            var component_clauseVisitor = new Component_clauseVisitor.Component_clauseVisitor();
            component_clause = component_clauseVisitor.visitComponent_clause(ctx.component_clause());
        }
        if (ctx.comment()) {
            var commentVisitor = new CommentVisitor.CommentVisitor();
            comment = commentVisitor.visitComment(ctx.comment());
        }

        return new Element.Element(import_clause, extends_clause, redeclare, is_final, inner, outer, 
            replaceable, constraining_clause, class_definition, component_clause, comment);
    }
};

ElementVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitElement = this.visitElement;
exports.ElementVisitor = ElementVisitor;