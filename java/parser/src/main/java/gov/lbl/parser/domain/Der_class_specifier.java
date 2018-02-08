package gov.lbl.parser.domain;

import java.util.Collection;

public class Der_class_specifier {
    private String der_left;
    private Collection<String> der_in;
    private String name;
    private Comment comment;

    public Der_class_specifier(String ident1,
    						   Collection<String> comma,
                               Collection<String> ident2,
                               String name,
                               Comment comment) {
      this.der_left = ident1;
      this.name = name;
      this.der_in = ident2;
      this.comment = comment;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Der_class_specifier aDer_class_specifier = (Der_class_specifier) o;

      if (der_left != null ? !der_left.equals(aDer_class_specifier.der_left) : aDer_class_specifier.der_left != null) return false;
      if (der_in != null ? !der_in.equals(aDer_class_specifier.der_in) : aDer_class_specifier.der_in != null) return false;
      return comment != null ? comment.equals(aDer_class_specifier.comment) : aDer_class_specifier.comment == null;
    }

    @Override
    public int hashCode() {
      int result = der_left != null ? der_left.hashCode() : 0;
      result = 31 * result + (der_in != null ? der_in.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Der_class_specifier{" +
              "\nder_left=" + der_left + '\'' +
              "\nname=" + name + '\'' +
              "\nder_in=" + der_in + '\'' +
              "\ncomment=" + comment + '\'' +
              '}';
    }
}
