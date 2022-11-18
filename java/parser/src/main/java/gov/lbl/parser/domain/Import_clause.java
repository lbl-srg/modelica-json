package gov.lbl.parser.domain;

public class Import_clause {
    private String identifier;
    private Name name;
    private Boolean dot_star;
    private Import_list import_list;
    private Comment comment;

    public Import_clause(String identifier, Name name, Boolean dot_star, Import_list import_list, Comment comment) {
        this.identifier  = identifier;
        this.name = name;
        this.dot_star = dot_star;
        this.import_list = import_list;
        this.comment = comment;
    }
}
