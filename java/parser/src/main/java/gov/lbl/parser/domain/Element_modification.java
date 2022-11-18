package gov.lbl.parser.domain;

public class Element_modification {
    private Name name;
    private Modification modification;
    private String string_comment;

    public Element_modification(Name name, Modification modification, String string_comment) {
        this.name = name;
        this.modification = modification;
        this.string_comment = string_comment;
    }
}
