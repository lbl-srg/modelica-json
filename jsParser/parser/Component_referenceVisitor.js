const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const { TerminalNode } = require('antlr4/tree/Tree');
const { modelicaParser } = require('../antlrFiles/modelicaParser');
const Component_reference = require('../domain/Component_reference');
const Component_reference_part = require('../domain/Component_reference_part');

const Array_subscriptsVisitor = require('./Array_subscriptsVisitor');

class Component_referenceVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitComponent_reference(ctx) {
        var component_reference_parts = [];

        var component_reference_part = null;
        var dot_op = false;
        var array_subscriptsVisitor = new Array_subscriptsVisitor.Array_subscriptsVisitor();
        ctx.children.forEach(child => {
            if (child instanceof TerminalNode) {
                if (child.getText() == ".") {
                    if (component_reference_part == null) {
                        component_reference_part = new Component_reference_part.Component_reference_part(null, null, null);
                    } else if (component_reference_part.get_identifier() != null) {
                        component_reference_parts.push(component_reference_part);
                        component_reference_part = new Component_reference_part.Component_reference_part(null, null, null);
                    }
                    dot_op = true;
                    component_reference_part.set_dot_op(dot_op);
                } else {
                    if (component_reference_part == null) {
                        component_reference_part = new Component_reference_part.Component_reference_part(null, null, null);
                        dot_op = false;
                    } else {
                        component_reference_parts.push(component_reference_part);
                        component_reference_part = new Component_reference_part.Component_reference_part(null, null, null);
                        dot_op = false;
                    }
                    component_reference_part.set_dot_op(dot_op);
                    component_reference_part.set_identifier(child.getText());
                }
            } else if (child instanceof modelicaParser.Array_subscriptsContext) {
                if (component_reference_part == null) {
                    component_reference_part = new Component_reference_part.Component_reference_part(null, null, null);
                    component_reference_part.set_dot_op(false);
                    component_reference_part.set_identifier("");
                }
                var array_subscripts = array_subscriptsVisitor.visitArray_subscripts(child);
                component_reference_part.set_array_subscripts(array_subscripts);
            }
        });

        if (component_reference_part != null) {
            component_reference_parts.push(component_reference_part);
        }

        return new Component_reference.Component_reference(component_reference_parts);
    }
};

Component_referenceVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitComponent_reference = this.visitComponent_reference;
exports.Component_referenceVisitor = Component_referenceVisitor;
