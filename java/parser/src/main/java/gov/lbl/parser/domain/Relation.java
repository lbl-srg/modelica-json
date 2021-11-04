package gov.lbl.parser.domain;

public class Relation {
    private Arithmetic_expression arithmetic_expression1;
    private String rel_op;
    private Arithmetic_expression arithmetic_expression2;

    public Relation(Arithmetic_expression arithmetic_expression1, String rel_op, Arithmetic_expression arithmetic_expression2) {
        this.arithmetic_expression1 = arithmetic_expression1;
        this.rel_op = rel_op;
        this.arithmetic_expression2 = arithmetic_expression2;
    }
}