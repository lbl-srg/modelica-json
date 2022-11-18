package gov.lbl.parser.domain;

public class Component_clause1 {
    private String type_prefix;
    private Type_specifier type_specifier;
    private Component_declaration1 component_declaration1;

    public Component_clause1 (String type_prefix, Type_specifier type_specifier, Component_declaration1 component_declaration1) {
        this.type_prefix = type_prefix;
        this.type_specifier = type_specifier;
        this.component_declaration1 = component_declaration1;
    }
}
