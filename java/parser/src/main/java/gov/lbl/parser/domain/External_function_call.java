package gov.lbl.parser.domain;

public class External_function_call {
	private Component_reference component_reference;
    private String name;
    private Expression_list expression_list;

    public External_function_call(String ident,
                                  Component_reference component_reference,
                                  Expression_list expression_list) {
      this.name = ident;
      this.component_reference = (component_reference == null ? null : component_reference);
      this.expression_list = (expression_list == null ? null : expression_list);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      External_function_call aExternal_function_call = (External_function_call) o;
      if (name != null ? !name.equals(aExternal_function_call.name) : aExternal_function_call.name != null) return false;
      if (component_reference != null ? !component_reference.equals(aExternal_function_call.component_reference) : aExternal_function_call.component_reference != null) return false;
      return expression_list != null ? !expression_list.equals(aExternal_function_call.expression_list) : aExternal_function_call.expression_list != null;
    }

    @Override
    public int hashCode() {
      int result = name != null ? name.hashCode() : 0;
      result = 31 * result + (component_reference != null ? component_reference.hashCode() : 0);
      result = 31 * result + (expression_list != null ? expression_list.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "External_function_call{" +
             "\ncomponent_reference=" + component_reference + '\'' +
             "\nname=" + name + '\'' +
             "\nexpression_list=" + expression_list + '\'' +
             '}';
    }
}
