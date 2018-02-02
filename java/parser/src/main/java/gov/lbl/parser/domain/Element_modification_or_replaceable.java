package gov.lbl.parser.domain;

public class Element_modification_or_replaceable {
    private String prefix;
    private Element_modification element_modification;
    private Element_replaceable element_replaceable;

    public Element_modification_or_replaceable(String each_dec,
                                               String final_dec,
                                               Element_modification element_modification,
                                               Element_replaceable element_replaceable) {
      this.prefix = (each_dec == null && final_dec == null) ? null
    		        : ((each_dec == null ? "" : (each_dec + " ")) + (final_dec == null ? "" : final_dec));
      this.element_modification = element_modification;
      this.element_replaceable = element_replaceable;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Element_modification_or_replaceable aElement_modification_or_replaceable = (Element_modification_or_replaceable) o;
      return (element_modification != null ? element_modification.equals(aElement_modification_or_replaceable.element_modification) : aElement_modification_or_replaceable.element_modification == null)
             || (element_replaceable != null ? element_replaceable.equals(aElement_modification_or_replaceable.element_replaceable) : aElement_modification_or_replaceable.element_replaceable == null);
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      result = 31 * result + (element_modification != null ? element_modification.hashCode() : 0);
      result = 31 * result + (element_replaceable != null ? element_replaceable.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Element_modification_or_replaceable{" +
              "\nprefix=" + prefix + '\'' +
              "\nelement_modification=" + element_modification + '\'' +
              "\nelement_replaceable=" + element_replaceable + '\'' +
              '}';
    }
}
