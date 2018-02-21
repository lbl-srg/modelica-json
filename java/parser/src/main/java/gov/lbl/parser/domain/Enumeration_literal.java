package gov.lbl.parser.domain;

public class Enumeration_literal {
    private String name;
    private Comment comment;

    public Enumeration_literal(String ident,
                               Comment comment) {
      this.name = ident;
      this.comment = comment;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Enumeration_literal aEnumeration_literal = (Enumeration_literal) o;
      if (name != null ? !name.equals(aEnumeration_literal.name) : aEnumeration_literal.name != null) return false;
      return comment != null ? comment.equals(aEnumeration_literal.comment) : aEnumeration_literal.comment == null;
    }

    @Override
    public int hashCode() {
      int result = name != null ? name.hashCode() : 0;
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Enumeration_literal{")
    			     .append("\nname=").append(name).append('\'')
    			     .append("\ncomment=").append(comment)
    			     .append('\'').append('}')
    			     .toString();
    }
}
