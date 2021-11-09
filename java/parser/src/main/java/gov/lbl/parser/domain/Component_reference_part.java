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

    public Boolean get_dot_op() {
        return this.dot_op;
    }

    public String get_identifier() {
        return this.identifier;
    }

    public Array_subscripts get_array_subscripts() {
        return this.array_subscripts;
    }

    public void set_dot_op(Boolean dot_op) {
        this.dot_op = dot_op;
    }

    public void set_identifier(String identifier) {
        this.identifier = identifier;
    }

    public void set_array_subscripts(Array_subscripts array_subscripts) {
        this.array_subscripts = array_subscripts;
    }
}
