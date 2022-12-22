package gov.lbl.parser.domain;

public class Element {
    private Import_clause import_clause;
    private Extends_clause extends_clause;
    private Boolean redeclare;
    private Boolean is_final;
    private Boolean inner;
    private Boolean outer;
    private Boolean replaceable;
    private Constraining_clause constraining_clause;
    private Class_definition class_definition;
    private Component_clause component_clause;
    private Comment comment;

    public Element(Import_clause import_clause, Extends_clause extends_clause, Boolean redeclare, Boolean is_final, Boolean inner, Boolean outer, Boolean replaceable, Constraining_clause constraining_clause, Class_definition class_definition, Component_clause component_clause, Comment comment) {
        this.import_clause = import_clause;
        this.extends_clause = extends_clause;
        this.redeclare = redeclare;
        this.is_final = is_final;
        this.inner = inner;
        this.outer = outer;
        this.replaceable = replaceable;
        this.constraining_clause = constraining_clause;
        this.class_definition = class_definition;
        this.component_clause = component_clause;
        this.comment = comment;
    }    
}
