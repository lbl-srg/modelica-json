package gov.lbl.parser.parser;

import java.util.List;

import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.TerminalNode;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Algorithm_section;
import gov.lbl.parser.domain.Annotation;
import gov.lbl.parser.domain.Composition;
import gov.lbl.parser.domain.Element_list;
import gov.lbl.parser.domain.Element_section;
import gov.lbl.parser.domain.Equation_section;
import gov.lbl.parser.domain.External_composition;
import gov.lbl.parser.domain.External_function_call;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class CompositionVisitor extends modelicaBaseVisitor<Composition> {
    @Override
    public Composition visitComposition(modelicaParser.CompositionContext ctx) {
        Element_list element_list = null;
        List<Element_section> element_sections = new ArrayList<Element_section>();

        Element_listVisitor element_listVisitor = new Element_listVisitor();
        Equation_sectionVisitor equation_sectionVisitor = new Equation_sectionVisitor();
        Algorithm_sectionVisitor algorithm_sectionVisitor = new Algorithm_sectionVisitor();

        List<ParseTree> children = ctx.children;
        String previous_element_list_modifier = null;

        for (ParseTree o : children) {            
            if ((o instanceof modelicaParser.Element_listContext)) {
                if (previous_element_list_modifier == null) {
                    element_list = o.accept(element_listVisitor); 
                } else if (previous_element_list_modifier.equals("protected")) { 
                    Element_list protected_element_list = o.accept(element_listVisitor); 
                    element_sections.add(new Element_section(null, protected_element_list, null, null));
                } else if (previous_element_list_modifier.equals("public")) { 
                    Element_list public_element_list = o.accept(element_listVisitor); 
                    element_sections.add(new Element_section(public_element_list, null, null, null));
                }
                
            } else if ((o instanceof modelicaParser.Equation_sectionContext)) {
                Equation_section equation_section = o.accept(equation_sectionVisitor);
                element_sections.add(new Element_section(null, null, equation_section, null));
            } else if ((o instanceof modelicaParser.Algorithm_sectionContext)) {
                Algorithm_section algorithm_section = o.accept(algorithm_sectionVisitor);
                element_sections.add(new Element_section(null, null, null, algorithm_section));
            } else if ((o instanceof modelicaParser.AnnotationContext)) {
                //nothing here
            } else if ((o instanceof TerminalNode)) {
                if (o.getText().equals("protected")) {
                    previous_element_list_modifier = "protected";
                } else if (o.getText().equals("public")) {
                    previous_element_list_modifier = "public";
                }
            } else { 
                //nothing here
            }
        }
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        List<Annotation> annotations = ctx.annotation() == null ? null : ctx.annotation()
                                                                            .stream()
                                                                            .map(single_annotation -> single_annotation.accept(annotationVisitor))
                                                                            .collect(toList());;
        Boolean external = ctx.EXTERNAL() == null ? false : true;

        Annotation external_annotation = null; 
        Annotation annotation = null; 
        
        if (annotations != null && annotations.size() > 0) {
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

        External_composition external_composition = null;
        if (external) {
            String language_specification = ctx.language_specification() == null ? "" : ctx.language_specification().getText();
            External_function_callVisitor external_function_callVisitor = new External_function_callVisitor();
            External_function_call external_function_call = ctx.external_function_call() == null ? null : ctx.external_function_call().accept(external_function_callVisitor);
            external_composition = new External_composition(language_specification, external_function_call, external_annotation);
        }
        
        return new Composition(element_list, element_sections, external_composition, annotation);
    }
}