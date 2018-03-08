package gov.lbl.parser.domain;

public class Enumeration_literal {
    private String name;
    private Comment comment;

    public Enumeration_literal(String ident,
                               Comment comment) {
      this.name = ident;
      this.comment = comment;
    }
}
