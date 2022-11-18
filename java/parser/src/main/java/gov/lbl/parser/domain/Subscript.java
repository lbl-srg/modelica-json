package gov.lbl.parser.domain;

public class Subscript {
    private Expression expression;
    private Boolean colon_op;

    public Subscript(Expression expression, Boolean colon_op) {
        this.expression = expression;
        this.colon_op = colon_op;
    }

}
