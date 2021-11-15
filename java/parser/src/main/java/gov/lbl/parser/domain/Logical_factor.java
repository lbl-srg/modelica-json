package gov.lbl.parser.domain;

public class Logical_factor {
    private Boolean not;
    private Relation relation;

    public Logical_factor(Boolean not, Relation relation) {
        this.not = not;
        this.relation = relation;
    }
}
