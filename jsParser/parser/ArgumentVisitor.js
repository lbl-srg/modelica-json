const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Argument = require('../domain/Argument');

const Element_modification_or_replaceableVisitor = require('./Element_modification_or_replaceableVisitor');
const Element_redeclarationVisitor = require('./Element_redeclarationVisitor');

class ArgumentVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitArgument(ctx) {
        var element_modification_or_replaceable = null;
        var element_redeclaration = null;

        if (ctx.element_modification_or_replaceable()) {
            var element_modification_or_replaceableVisitor = new Element_modification_or_replaceableVisitor.Element_modification_or_replaceableVisitor();
            element_modification_or_replaceable = element_modification_or_replaceableVisitor.visitElement_modification_or_replaceable(ctx.element_modification_or_replaceable());
        }
        if (ctx.element_redeclaration()) {
            var element_redeclarationVisitor = new Element_redeclarationVisitor.Element_redeclarationVisitor();
            element_redeclaration = element_redeclarationVisitor.visitElement_redeclaration(ctx.element_redeclaration());
        }
        
        return new Argument.Argument(element_modification_or_replaceable, element_redeclaration);
    }
};

ArgumentVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitArgument_list = this.visitArgument_list;
exports.ArgumentVisitor = ArgumentVisitor;