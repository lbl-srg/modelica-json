package gov.lbl.parser.domain;

public class Declaration {
    private String identifier;
    private Array_subscripts array_subscripts;
    private Modification modification;

    public Declaration(String identifier, Array_subscripts array_subscripts, Modification modification) {
        this.identifier = identifier;
        this.array_subscripts = array_subscripts;
        this.modification = modification;
    }
}
