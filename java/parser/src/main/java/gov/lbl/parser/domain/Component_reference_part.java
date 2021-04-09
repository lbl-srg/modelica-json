package gov.lbl.parser.domain;

public class Component_reference_part {
    private Boolean dot_op;
    private String identifier;
    private Array_subscripts array_subscripts;

    public Component_reference_part(Boolean dot_op, String identifier, Array_subscripts array_subscripts) {
        this.dot_op = dot_op;
        this.identifier = identifier;
        this.array_subscripts = array_subscripts;
    }
}
