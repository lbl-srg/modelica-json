package gov.lbl.parser.domain;

public class Assignment_equation {
    private Simple_expression lhs;
    private Expression rhs;

    public Assignment_equation(Simple_expression lhs, Expression rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }
}
