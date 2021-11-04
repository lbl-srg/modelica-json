package gov.lbl.parser.domain;

public class For_index {
    private String identifier;
    private Expression expression;

    public For_index(String identifier, Expression expression) {
        this.identifier = identifier;
        this.expression = expression;
    }
}
