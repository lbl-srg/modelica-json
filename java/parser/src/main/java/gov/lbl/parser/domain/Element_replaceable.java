package gov.lbl.parser.domain;

public class Element_replaceable {
    private String prefix;
    private Short_class_definition short_class_definition;
    private String component_clause1;
    private Constraining_clause constraining_clause;

    public Element_replaceable(String rep_dec,
                               Short_class_definition short_class_definition,
                               String component_clause1,
                               Constraining_clause constraining_clause) {
      this.prefix = rep_dec;
      this.short_class_definition = short_class_definition;
      this.component_clause1 = component_clause1;
      this.constraining_clause = (constraining_clause==null ? null : constraining_clause);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Element_replaceable aElement_replaceable = (Element_replaceable) o;
      if (prefix != null ? !prefix.equals(aElement_replaceable.prefix) : aElement_replaceable.prefix != null) return false;
      return (short_class_definition != null ? short_class_definition.equals(aElement_replaceable.short_class_definition) : aElement_replaceable.short_class_definition == null)
              || (component_clause1 != null ? component_clause1.equals(aElement_replaceable.component_clause1) : aElement_replaceable.component_clause1 == null)
              || (constraining_clause != null ? constraining_clause.equals(aElement_replaceable.constraining_clause) : aElement_replaceable.constraining_clause == null);
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      result = 31 * result + (short_class_definition != null ? short_class_definition.hashCode() : 0);
      result = 31 * result + (component_clause1 != null ? component_clause1.hashCode() : 0);
      result = 31 * result + (constraining_clause != null ? constraining_clause.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Element_replaceable{")
    			     .append("\nprefix=").append(prefix).append('\'')
    			     .append("\nshort_class_definition=").append(short_class_definition).append('\'')
    			     .append("\ncomponent_clause1=").append(component_clause1).append('\'')
    			     .append("\nconstraining_clause=").append(constraining_clause)
    			     .append('\'').append('}')
    			     .toString();
    }
}
