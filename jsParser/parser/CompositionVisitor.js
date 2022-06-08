const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Composition = require('../domain/Composition');
const External_composition = require('../domain/External_composition');
const Element_section = require('../domain/Element_section');

const Element_listVisitor = require('./Element_listVisitor');
const Equation_sectionVisitor = require('./Equation_sectionVisitor');
const Algorithm_sectionVisitor = require('./Algorithm_sectionVisitor');
const AnnotationVisitor = require('./AnnotationVisitor');
const External_function_callVisitor = require('./External_function_callVisitor');
const { TerminalNode } = require('antlr4/tree/Tree');
const { modelicaParser } = require('../antlrFiles/modelicaParser');

class CompositionVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitComposition(ctx) {
        var element_list = null;
        var element_sections = [];
        var external_composition = null;
        var annotation = null;
        var external = false;
        var external_annotation = null;

        var previous_element_list_modifier = null;
        ctx.children.forEach(child => {
            if (child instanceof modelicaParser.Element_listContext) {
                var element_listVisitor = new Element_listVisitor.Element_listVisitor();
                if (previous_element_list_modifier == null) {
                    element_list = element_listVisitor.visitElement_list(child);
                } else if (previous_element_list_modifier == "protected") {
                    var protected_element_list = element_listVisitor.visitElement_list(child);
                    element_sections.push(new Element_section.Element_section(null, protected_element_list, null, null));
                } else if (previous_element_list_modifier == "public") {
                    var public_element_list = element_listVisitor.accept(child);
                    element_sections.push(new Element_section.Element_section(public_element_list, null, null, null));
                }
            } else if (child instanceof modelicaParser.Equation_sectionContext) {
                var equation_sectionVisitor = new Equation_sectionVisitor.Equation_sectionVisitor();
                var equation_section = equation_sectionVisitor.visitEquation_section(child);
                element_sections.push(new Element_section.Element_section(null, null, equation_section, null));
            } else if (child instanceof modelicaParser.Algorithm_sectionContext) {
                var algorithm_sectionVisitor = new Algorithm_sectionVisitor.Algorithm_sectionVisitor();
                var algorithm_section = algorithm_sectionVisitor.visitAlgorithm_section(child);
                element_sections.push(new Element_section.Element_section(null, null, null, algorithm_section));
            } else if (child instanceof modelicaParser.AnnotationContext) {
                //nothing here
            } else if (child instanceof TerminalNode) {
                if (child.getText() == "protected") {
                    previous_element_list_modifier = "protected";
                } else if (child.getText() == "public") {
                    previous_element_list_modifier = "public";
                }
            } else {
                //nothing here
            }
        });

        var annotationVisitor = new AnnotationVisitor.AnnotationVisitor();
        var annotations = []
        if (ctx.annotation()) { 
            ctx.annotation().forEach(ann => {
                annotations.push(annotationVisitor.visitAnnotation(ann));
            });
        }

        external = ctx.EXTERNAL() ? true: false;
    
        if (annotations.length > 0) {
            if (annotations.length == 2) {
                external_annotation = annotations[0];
                annotation = annotations[1];
            } else {
                if (external) {
                    external_annotation = annotations[0];
                } else {
                    annotation = annotations[0];
                }
            }
        }

        if (external) {
            var language_specification = ctx.language_specification() ? ctx.language_specification().getText(): "";
            var external_function_callVisitor = External_function_callVisitor.External_function_callVisitor();
            var external_function_call = ctx.external_function_call()? external_function_callVisitor.visitExternal_function_call(ctx.external_function_call()): null;
            external_composition = new External_composition.External_composition(language_specification, external_function_call, external_annotation);
        }
                
        return new Composition.Composition(element_list, element_sections, external_composition, annotation);
    }
};

CompositionVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitComposition = this.visitComposition;
exports.CompositionVisitor = CompositionVisitor;