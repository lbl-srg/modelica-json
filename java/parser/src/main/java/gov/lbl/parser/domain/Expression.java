package gov.lbl.parser.domain;

public class Expression {
    private Simple_expression simple_expression;
    private If_expression if_expression;

    public Expression(Simple_expression simple_expression, If_expression if_expression) {
        this.simple_expression = simple_expression;
        this.if_expression = if_expression;
    }
}