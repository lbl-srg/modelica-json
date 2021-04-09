package gov.lbl.parser.domain;

public class Connect_clause {
    private Component_reference from;
    private Component_reference to;

    public Connect_clause(Component_reference from, Component_reference to) {
        this.from = from;
        this.to = to;
    }
}