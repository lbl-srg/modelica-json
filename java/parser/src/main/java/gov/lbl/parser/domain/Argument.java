package gov.lbl.parser.domain;

public class Argument {
    private Element_modification_or_replaceable element_modification_or_replaceable;
    private Element_redeclaration element_redeclaration;

    public Argument(Element_modification_or_replaceable element_modification_or_replaceable,
                    Element_redeclaration element_redeclaration) {
      this.element_modification_or_replaceable = element_modification_or_replaceable;
      this.element_redeclaration = element_redeclaration;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Argument aArgument = (Argument) o;
      return (element_modification_or_replaceable != null ? element_modification_or_replaceable.equals(aArgument.element_modification_or_replaceable) : aArgument.element_modification_or_replaceable == null)
             || (element_redeclaration != null ? element_redeclaration.equals(aArgument.element_redeclaration) : aArgument.element_redeclaration == null);
    }

    @Override
    public int hashCode() {
      int result = element_modification_or_replaceable != null ? element_modification_or_replaceable.hashCode() : 0;
      result = 31 * result + (element_redeclaration != null ? element_redeclaration.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Argument{" +
              "\nelement_modification_or_replaceable=" + element_modification_or_replaceable + '\'' +
              "\nelement_redeclaration=" + element_redeclaration + '\'' +
              '}';
    }
}
