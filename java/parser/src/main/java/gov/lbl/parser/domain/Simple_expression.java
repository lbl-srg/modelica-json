package gov.lbl.parser.domain;

public class Simple_expression {
    //simple_expression: logical_expression (SYMBOL_COLON logical_expression (SYMBOL_COLON logical_expression)?)?
    private Logical_expression logical_expression1;
    private Logical_expression logical_expression2;
    private Logical_expression logical_expression3;

    public Simple_expression(Logical_expression logical_expression1, Logical_expression logical_expression2, Logical_expression logical_expression3) {
        this.logical_expression1 = logical_expression1;
        this.logical_expression2 = logical_expression2;
        this.logical_expression3 = logical_expression3;
    }

}
