package gov.lbl.parser.domain;

public class Class_specifier {
    private Long_class_specifier long_class_specifier;
    private Short_class_specifier short_class_specifier;
    private Der_class_specifier der_class_specifier;

    public Class_specifier(Long_class_specifier long_class_specifier,
    		Short_class_specifier short_class_specifier,
                           Der_class_specifier der_class_specifier) {
      this.long_class_specifier = long_class_specifier;
      this.short_class_specifier = short_class_specifier;
      this.der_class_specifier = der_class_specifier;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Class_specifier aClass_specifier = (Class_specifier) o;
      return (long_class_specifier != null ? long_class_specifier.equals(aClass_specifier.long_class_specifier) : aClass_specifier.long_class_specifier == null)
              || (short_class_specifier != null ? short_class_specifier.equals(aClass_specifier.short_class_specifier) : aClass_specifier.short_class_specifier == null)
              || (der_class_specifier != null ? der_class_specifier.equals(aClass_specifier.der_class_specifier) : aClass_specifier.der_class_specifier == null);
    }

    @Override
    public int hashCode() {
      int result = long_class_specifier != null ? long_class_specifier.hashCode() : 0;
      result = 31 * result + (short_class_specifier != null ? short_class_specifier.hashCode() : 0);
      result = 31 * result + (der_class_specifier != null ? der_class_specifier.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Class_specifier{" +
              "\nlong_class_specifier=" + long_class_specifier + '\'' +
              "\nshort_class_specifier=" + short_class_specifier + '\'' +
              "\nder_class_specifier=" + der_class_specifier + '\'' +
              '}';
    }
}
