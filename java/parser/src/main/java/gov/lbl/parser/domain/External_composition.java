package gov.lbl.parser.domain;

import gov.lbl.antlr4.visitor.modelicaParser.External_function_callContext;

public class External_composition {
    private String language_specification;
    private External_function_call external_function_call;
    private Annotation annotation;
    
    public External_composition(String language_specification, External_function_call external_function_call, Annotation annotation) {
        this.language_specification = language_specification;
        this.external_function_call = external_function_call;
        this.annotation = annotation;
    }
}
