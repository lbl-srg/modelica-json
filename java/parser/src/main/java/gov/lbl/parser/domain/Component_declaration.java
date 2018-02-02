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

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Component_declaration aComponent_declaration = (Component_declaration) o;
      if (declaration != null ? !declaration.equals(aComponent_declaration.declaration) : aComponent_declaration.declaration != null) return false;
      if (comment != null ? !comment.equals(aComponent_declaration.comment) : aComponent_declaration.comment != null) return false;
      return comment != null ? comment.equals(aComponent_declaration.comment) : aComponent_declaration.comment == null;
    }

    @Override
    public int hashCode() {
      int result = declaration != null ? declaration.hashCode() : 0;
      result = 31 * result + (condition_attribute != null ? condition_attribute.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      //result = 31 * result + (annotation != null ? annotation.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Component_declaration{" +
              "\ndeclaration=" + declaration + '\'' +
              "\ncondition_attribute=" + condition_attribute + '\'' +
              "\ncomment=" + comment + '\'' +
              //"\nannotation=" + annotation + '\'' +
              '}';
    }
}
