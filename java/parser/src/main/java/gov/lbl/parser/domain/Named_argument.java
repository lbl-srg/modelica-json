package gov.lbl.parser.domain;

public class Named_argument {
    private String identifier;
    private Function_argument value;

    public Named_argument(String identifier, Function_argument value) {
        this.identifier = identifier;
        this.value = value;
    }
}
