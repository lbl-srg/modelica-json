const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Short_class_definition = require('../domain/Short_class_definition');

const Class_prefixesVisitor = require('./Class_prefixesVisitor');
const Short_class_specifierVisitor = require('./Short_class_specifierVisitor');

class Short_class_definitionVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitShort_class_definition(ctx) {
        var class_prefixes = "";
        var short_class_specifier = null;

        if (ctx.class_prefixes()) {
            var class_prefixesVisitor = new Class_prefixesVisitor.Class_prefixesVisitor();
            class_prefixes = class_prefixesVisitor.visitClass_prefixes(ctx.class_prefixes());
        }

        if (ctx.short_class_specifier()) {
            var short_class_specifierVisitor = new Short_class_specifierVisitor.Short_class_specifierVisitor();
            short_class_specifier = short_class_specifierVisitor.visitShort_class_specifier(ctx.short_class_specifier());
        }
        return new Short_class_definition.Short_class_definition(class_prefixes, short_class_specifier);
    }
};

Short_class_definitionVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitShort_class_definition = this.visitShort_class_definition;
exports.Short_class_definitionVisitor = Short_class_definitionVisitor;

