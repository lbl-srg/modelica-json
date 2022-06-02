const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Constraining_clause = require('../domain/Constraining_clause');

const NameVisitor = require('./NameVisitor');
const Class_modificationVisitor = require('./Class_modificationVisitor');

class Constraining_clauseVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitConstraining_clause(ctx) {
        var name = null;
        var class_modification = null;
        
        if (ctx.name()) {
            var nameVisitor = new NameVisitor.NameVisitor();
            name = nameVisitor.visitName(ctx.name());
        }

        if (ctx.class_modification()) {
            var class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor();
            class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification());
        }

        return new Constraining_clause.Constraining_clause(name, class_modification);
    }
};

Constraining_clauseVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitConstraining_clause = this.visitConstraining_clause;
exports.Constraining_clauseVisitor = Constraining_clauseVisitor;