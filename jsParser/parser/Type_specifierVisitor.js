const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const { Name } = require('../domain/Name');
const Type_specifier = require('../domain/Type_specifier');

const NameVisitor = require('./NameVisitor');

class Type_specifierVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitType_specifier(ctx) {
        var name = null;

        if (ctx.name()) {
            var nameVisitor = new NameVisitor.NameVisitor();
            name = nameVisitor.visitName(ctx.name());
        }
        
        return new Type_specifier.Type_specifier(name);
    }
};

Type_specifierVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitType_specifier = this.visitType_specifier;
exports.Type_specifierVisitor = Type_specifierVisitor;