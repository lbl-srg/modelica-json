package gov.lbl.parser.domain;

public class Element_redeclaration {
    private String prefix;
    private Short_class_definition short_class_definition;
    private String component_clause1;
    private Element_replaceable element_replaceable;

    public Element_redeclaration(String red_dec,
                                 String each_dec,
                                 String final_dec,
                                 Short_class_definition short_class_definition,
                                 String component_clause1,
                                 Element_replaceable element_replaceable) {
      this.prefix = red_dec + (each_dec==null ? "" : (" " + each_dec)) + (final_dec==null ? "" : (" " + final_dec));
      this.short_class_definition = short_class_definition;
      this.component_clause1 = component_clause1;
      this.element_replaceable = element_replaceable;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Element_redeclaration aElement_redeclaration = (Element_redeclaration) o;
      if (prefix != null ? !prefix.equals(aElement_redeclaration.prefix) : aElement_redeclaration.prefix != null) return false;
      return (short_class_definition != null ? short_class_definition.equals(aElement_redeclaration.short_class_definition) : aElement_redeclaration.short_class_definition == null)
             || (component_clause1 != null ? component_clause1.equals(aElement_redeclaration.component_clause1) : aElement_redeclaration.component_clause1 == null)
             || (element_replaceable != null ? element_replaceable.equals(aElement_redeclaration.element_replaceable) : aElement_redeclaration.element_replaceable == null);
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      result = 31 * result + (short_class_definition != null ? short_class_definition.hashCode() : 0);
      result = 31 * result + (component_clause1 != null ? component_clause1.hashCode() : 0);
      result = 31 * result + (element_replaceable != null ? element_replaceable.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Element_redeclaration{" +
    		 "\nprefix=" + prefix + '\'' +
             "\nshort_class_definition=" + short_class_definition + '\'' +
             "\ncomponent_clause1=" + component_clause1 + '\'' +
             "\nelement_replaceable=" + element_replaceable + '\'' +
             '}';
    }
}
