package gov.lbl.parser.domain;

public class External_function_call {
    private Component_reference component_reference;
    private String identifier;
    private Expression_list expression_list;

    public External_function_call(Component_reference component_reference, String identifier, Expression_list expression_list) {
        this.component_reference = component_reference;
        this.identifier = identifier;
        this.expression_list = expression_list;
    }
}
