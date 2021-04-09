package gov.lbl.parser.domain;

public class Remaining_factor {
    private String mul_op;   // '*' | '/' | '.*' | './'
    private Factor factor;

    public Remaining_factor(String mul_op, Factor factor) {
        this.mul_op = mul_op;
        this.factor = factor;
    }
}
