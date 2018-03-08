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
}
