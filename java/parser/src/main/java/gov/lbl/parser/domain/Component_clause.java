package gov.lbl.parser.domain;

public class Component_clause {
    private String type_prefix;
    private String type_specifier;
    private String array_subscripts;
    private Component_list component_list;

    public Component_clause(String type_prefix,
    			            String type_specifier,
    		                String array_subscripts,
                            Component_list component_list) {
      this.type_prefix = type_prefix;
      this.type_specifier = type_specifier;
      this.array_subscripts = (array_subscripts==null ? null : array_subscripts);
      this.component_list = component_list;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Component_clause aComponent_clause = (Component_clause) o;
      if (type_prefix != null ? !type_prefix.equals(aComponent_clause.type_prefix) : aComponent_clause.type_prefix != null) return false;
      if (type_specifier != null ? !type_specifier.equals(aComponent_clause.type_specifier) : aComponent_clause.type_specifier != null) return false;
      if (component_list != null ? !component_list.equals(aComponent_clause.component_list) : aComponent_clause.component_list != null) return false;
      return array_subscripts != null ? array_subscripts.equals(aComponent_clause.array_subscripts) : aComponent_clause.array_subscripts == null;
    }

    @Override
    public int hashCode() {
      int result = type_prefix != null ? type_prefix.hashCode() : 0;
      result = 31 * result + (type_specifier != null ? type_specifier.hashCode() : 0);
      result = 31 * result + (array_subscripts != null ? array_subscripts.hashCode() : 0);
      result = 31 * result + (component_list != null ? component_list.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Component_clause{")
    			     .append("\ntype_prefix=").append(type_prefix).append('\'')
    			     .append("\ntype_specifier=").append(type_specifier).append('\'')
    			     .append("\narray_subscripts=").append(array_subscripts).append('\'')
    			     .append("\ncomponent_list=").append(component_list)
    			     .append('\'').append('}')
    			     .toString();
    }
}
