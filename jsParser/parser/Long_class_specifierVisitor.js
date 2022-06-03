const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Long_class_specifier = require('../domain/Long_class_specifier');

const String_commentVisitor = require('./String_commentVisitor');
const CompositionVisitor = require('./CompositionVisitor');
const Class_modificationVisitor = require('./Class_modificationVisitor');

class Long_class_specifierVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitLong_class_specifier(ctx) {
        var identifier = "";
        var string_comment = null;
        var composition = null;
        var is_extends = false;
        var class_modification = null;
        
        if (ctx.IDENT()) {
            identifier = ctx.IDENT(0).getText();
        }

        if (ctx.string_comment()) {
            var string_commentVisitor = new String_commentVisitor.String_commentVisitor();
            string_comment = string_commentVisitor.visitString_comment(ctx.string_comment());
        }

        if (ctx.composition()) {
            var compositionVisitor = new CompositionVisitor.CompositionVisitor();
            composition = compositionVisitor.visitComposition(ctx.composition());
        }

        if (ctx.EXTENDS()) {
            is_extends = true;
        }
        
        if (ctx.class_modification()) {
            var class_modificationVisitor = new Class_modificationVisitor.Class_modificationVisitor();
            class_modification = class_modificationVisitor.visitClass_modification(ctx.class_modification());
        }
        return new Long_class_specifier.Long_class_specifier(identifier, string_comment, composition, is_extends, class_modification);
    }
};

Long_class_specifierVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitLong_class_specifier = this.visitLong_class_specifier;
exports.Long_class_specifierVisitor = Long_class_specifierVisitor;

