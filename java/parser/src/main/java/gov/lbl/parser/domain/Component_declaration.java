package gov.lbl.parser.domain;

public class Component_declaration {
    Declaration declaration;
    String condition_attribute;
    Comment comment;

    public Component_declaration(Declaration declaration,
    		                     String condition_attribute,
                                 Comment comment) {
      this.declaration = declaration;
      this.condition_attribute = (condition_attribute == null ? null : condition_attribute);
      this.comment = (comment.string_comment==null && comment.annotation==null) ? null : comment;
    }
}
