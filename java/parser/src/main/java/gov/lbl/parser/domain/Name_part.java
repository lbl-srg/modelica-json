package gov.lbl.parser.domain;

public class Name_part {
    private Boolean dot_op;
    private String identifier;

    public Name_part(Boolean dot_op, String identifier) {
        this.dot_op = dot_op;
        this.identifier = identifier;
    }
}