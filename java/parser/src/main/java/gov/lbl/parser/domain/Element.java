package gov.lbl.parser.domain;

public class Element {
    private String prefix;
    private String replaceable;
    private Import_clause import_clause;
    private Extends_clause extends_clause;
    private Class_definition class_definition;
    private Class_definition replaceable_class_definition;
    private Component_clause component_clause;
    private Component_clause replaceable_component_clause;
    private String constraining_clause;
    private Comment comment;

    public Element(String red_dec,
                   String final_dec,
                   String inner_dec,
                   String outer_dec,
                   String rep_dec,
                   Import_clause import_clause,
                   Extends_clause extends_clause,
                   Class_definition class_definition1,
                   Class_definition class_definition2,
                   Component_clause component_clause1,
                   Component_clause component_clause2,
                   String constraining_clause,
                   Comment comment) {
    	this.import_clause = import_clause;
    	this.extends_clause = extends_clause;
    	this.prefix = (red_dec==null && final_dec==null && inner_dec==null && outer_dec==null) ? null
    			      : ((red_dec==null ? "" : (red_dec + " ")) + (final_dec==null ? "" : (final_dec + " "))
    			         + (inner_dec==null ? "" : (inner_dec + " ")) + (outer_dec==null ? "" : outer_dec));
    	this.class_definition = class_definition1;
    	this.component_clause = component_clause1;
    	this.replaceable = rep_dec;
    	this.replaceable_class_definition = class_definition2;
    	this.replaceable_component_clause = component_clause2;
    	this.constraining_clause = constraining_clause;
    	this.comment = comment;
    }
}
