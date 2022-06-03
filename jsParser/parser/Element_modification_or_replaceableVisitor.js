const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Element_modification_or_replaceable = require('../domain/Element_modification_or_replaceable');

const Element_modificationVisitor = require('./Element_modificationVisitor');
const Element_replaceableVisitor = require('./Element_replaceableVisitor');

class Element_modification_or_replaceableVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitElement_modification_or_replaceable(ctx) {
        var each = ctx.EACH()? true: false;
        var is_final = ctx.FINAL()? true: false;
        var element_modification = null;
        var element_replaceable = null;

        if (ctx.element_modification()) {
            var element_modificationVisitor = new Element_modificationVisitor.Element_modificationVisitor();
            element_modification = element_modificationVisitor.visitElement_modification(ctx.element_modification());
        }
        if (ctx.element_replaceable()) {
            var element_replaceableVisitor = new Element_replaceableVisitor.Element_replaceableVisitor();
            element_replaceable = element_replaceableVisitor.visitElement_replaceable(ctx.element_replaceable());
        }
        
        return new Element_modification_or_replaceable.Element_modification_or_replaceable(each, is_final, element_modification, element_replaceable);
    }
};

Element_modification_or_replaceableVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitElement_modification_or_replaceable = this.visitElement_modification_or_replaceable;
exports.Element_modification_or_replaceableVisitor = Element_modification_or_replaceableVisitor;