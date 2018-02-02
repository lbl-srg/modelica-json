package gov.lbl.parser.domain;

public class Long_class_specifier {
    private String prefix;
    private String name;
    private String class_modification;
    private String comment;
    private Composition composition;


    public Long_class_specifier(String extends_dec,
                                String ident,
                                String string_comment,
                                Composition composition,
                                String class_modification) {
      this.prefix = extends_dec;
      this.name = ident;
      this.class_modification = (class_modification == null ? null : class_modification);
      this.comment = string_comment;
      this.composition = composition;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Long_class_specifier aLong_class_specifier = (Long_class_specifier) o;

      if (name != null ? !name.equals(aLong_class_specifier.name) : aLong_class_specifier.name != null) return false;
      if (comment != null ? !comment.equals(aLong_class_specifier.comment) : aLong_class_specifier.comment != null) return false;
      if (composition != null ? !composition.equals(aLong_class_specifier.composition) : aLong_class_specifier.composition != null) return false;
      return class_modification != null ? class_modification.equals(aLong_class_specifier.class_modification) : aLong_class_specifier.class_modification == null;
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      result = 31 * result + (name != null ? name.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      result = 31 * result + (composition != null ? composition.hashCode() : 0);
      result = 31 * result + (class_modification != null ? class_modification.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	return "Long_class_specifier{" +
               "\nprefix=" + prefix + '\'' +
               "\nname=" + name + '\'' +
               "\nclass_modification=" + class_modification + '\'' +
               "\ncomment=" + comment + '\'' +
               "\ncomposition=" + composition + '\'' +
               '}';
    }
}
