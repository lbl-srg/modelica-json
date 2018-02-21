package gov.lbl.parser.domain;

public class Base_prefix {
    private Type_prefix type_prefix;

    public Base_prefix(Type_prefix type_prefix) {
      this.type_prefix = type_prefix;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Base_prefix aBase_prefix = (Base_prefix) o;
      return type_prefix != null ? type_prefix.equals(aBase_prefix.type_prefix) : aBase_prefix.type_prefix == null;
    }

    @Override
    public int hashCode() {
      int result = type_prefix != null ? type_prefix.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Base_prefix{")
    			     .append("\ntype_prefix=").append(type_prefix)
    			     .append('\'').append('}')
    			     .toString();
    }
}
