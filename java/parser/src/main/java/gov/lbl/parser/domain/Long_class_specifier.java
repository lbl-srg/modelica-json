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
}
