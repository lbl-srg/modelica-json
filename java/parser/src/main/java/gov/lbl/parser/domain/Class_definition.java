package gov.lbl.parser.domain;

public class Class_definition {
    private String encapsulated;
    private String class_prefixes;
    private Class_specifier class_specifier;

    public Class_definition(String enca_dec,
    						String class_prefixes,
                            Class_specifier class_specifier) {
      this.encapsulated = (enca_dec == null ? null : enca_dec);
      this.class_prefixes = class_prefixes;
      this.class_specifier = class_specifier;
    }
}
