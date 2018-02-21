package gov.lbl.parser.domain;

public class Extends_clause {
    private String name;
    private String class_modification;
    private String annotation;

    public Extends_clause(String ext_dec,
    		              String name,
    		              String class_modification,
    		              String annotation) {
      this.name = name;
      this.class_modification = (class_modification == null ? null : class_modification);
      this.annotation  = (annotation == null ? null : annotation);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Extends_clause aExtends_clause = (Extends_clause) o;
      return name != null ? name.equals(aExtends_clause.name) : aExtends_clause.name == null;
    }

    @Override
    public int hashCode() {
      int result = name != null ? name.hashCode() : 0;
      result = 31 * result + (class_modification != null ? class_modification.hashCode() : 0);
      result = 31 * result + (annotation != null ? annotation.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Extends_clause{")
    			     .append("\nname=").append(name).append('\'')
    			     .append("\nclass_modification=").append(class_modification).append('\'')
    			     .append("\nannotation=").append(annotation)
    			     .append('\'').append('}')
    			     .toString();
    }
}
