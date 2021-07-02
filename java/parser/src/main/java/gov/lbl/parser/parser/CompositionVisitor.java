package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Algorithm_section;
import gov.lbl.parser.domain.Annotation;
import gov.lbl.parser.domain.Composition;
import gov.lbl.parser.domain.Element_list;
import gov.lbl.parser.domain.Equation_section;
import gov.lbl.parser.domain.External_composition;
import gov.lbl.parser.domain.External_function_call;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class CompositionVisitor extends modelicaBaseVisitor<Composition> {
    @Override
    public Composition visitComposition(modelicaParser.CompositionContext ctx) {
        List<String> element_lists_types = new ArrayList<String>();
        element_lists_types.add("None");

        for (int i=1; i<ctx.getChildCount(); i++) {
            if (ctx.getChild(i).getClass() == modelicaParser.Element_listContext.class) {
                String public_protected_type = ctx.getChild(i-1).getText();
                if (public_protected_type.equals("protected")) {
                    element_lists_types.add("protected");
                }
                else if (public_protected_type.equals("public")) {
                    element_lists_types.add("public");
                }
            }
        }

        Element_listVisitor element_listVisitor = new Element_listVisitor();
        Equation_sectionVisitor equation_sectionVisitor = new Equation_sectionVisitor();
        Algorithm_sectionVisitor algorithm_sectionVisitor = new Algorithm_sectionVisitor();
        
        List<Element_list> element_lists = ctx.element_list()
            .stream()
            .map(element_list -> element_list.accept(element_listVisitor))
            .collect(toList()); 
        
        Element_list element_list = element_lists.get(0);

        List<String> public_dec = ctx.PUBLIC() == null ? null : ctx.PUBLIC()
            .stream()
            .map(PUBLIC -> PUBLIC.getText())
            .collect(toList());

        List<String> protected_dec = ctx.PUBLIC() == null ? null : ctx.PROTECTED()
            .stream()
            .map(PROTECTED -> PROTECTED.getText())
            .collect(toList());
        
        List<Element_list> public_element_lists = public_dec == null ? null : new ArrayList<Element_list>();
        List<Element_list> protected_element_lists = protected_dec == null ? null : new ArrayList<Element_list>();
        
        for(int i=1; i<element_lists.size(); i++) {
            if (element_lists_types.get(i) == "public") {
                public_element_lists.add(element_lists.get(i));
            }

            if (element_lists_types.get(i) == "protected") {
                protected_element_lists.add(element_lists.get(i));
            }            
        }

        List<Equation_section> equation_sections = ctx.equation_section() == null ? null : ctx.equation_section()
                                                                                .stream()
                                                                                .map(equation_section -> equation_section.accept(equation_sectionVisitor))
                                                                                .collect(toList());;
        List<Algorithm_section> algorithm_sections = ctx.algorithm_section() == null ? null : ctx.algorithm_section()
                                                                                .stream()
                                                                                .map(algorithm_section -> algorithm_section.accept(algorithm_sectionVisitor))
                                                                                .collect(toList());;

        Boolean external = ctx.EXTERNAL() == null ? false : true;
        String language_specification = ctx.language_specification() == null ? "" : ctx.language_specification().getText();
        
        External_function_callVisitor external_function_callVisitor = new External_function_callVisitor();
        External_function_call external_function_call = ctx.external_function_call() == null ? null : ctx.external_function_call().accept(external_function_callVisitor);
        
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        List<Annotation> annotations = ctx.annotation() == null ? null : ctx.annotation()
                                                                            .stream()
                                                                            .map(single_annotation -> single_annotation.accept(annotationVisitor))
                                                                            .collect(toList());;
        Annotation external_annotation = null; 
        Annotation annotation = null; 
        if (annotations != null) {
            if (annotations.size() == 2) {
                external_annotation = annotations.get(0);
                annotation = annotations.get(1);
            }
            else {
                if (external) {
                    external_annotation = annotations.get(0);
                }
                else {
                    annotation = annotations.get(0);
                }
            }
        }
        External_composition external_composition = new External_composition(language_specification, external_function_call, external_annotation);
        
        return new Composition(element_list, public_element_lists, protected_element_lists, equation_sections, algorithm_sections, external_composition, annotation);
    }
}