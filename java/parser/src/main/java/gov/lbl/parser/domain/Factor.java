package gov.lbl.parser.domain;

public class Factor {
    private Primary primary1;
    private String op;      // '^' | '.^'
    private Primary primary2;

    public Factor(Primary primary1, String op, Primary primary2) {
        this.primary1 = primary1;
        this.op = op;
        this.primary2 = primary2;
    }

}
