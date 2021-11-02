package gov.lbl.parser.domain;

public class Component_clause {
    private String type_prefix;
    private Type_specifier type_specifier;
    private Array_subscripts array_subscripts;
    private Component_list component_list;

    public Component_clause(String type_prefix, Type_specifier type_specifier, Array_subscripts array_subscripts, Component_list component_list) {
        this.type_prefix = type_prefix;
        this.type_specifier = type_specifier;
        this.array_subscripts = array_subscripts;
        this.component_list = component_list;
    }
}
