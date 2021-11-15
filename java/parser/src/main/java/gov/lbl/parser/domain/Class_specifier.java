package gov.lbl.parser.domain;

public class Class_specifier {
    private Long_class_specifier long_class_specifier;
    private Short_class_specifier short_class_specifier;
    private Der_class_specifier der_class_specifier;

    public Class_specifier(Long_class_specifier long_class_specifier, Short_class_specifier short_class_specifier, Der_class_specifier der_class_specifier) {
        this.long_class_specifier = long_class_specifier;
        this.short_class_specifier = short_class_specifier;
        this.der_class_specifier = der_class_specifier;
   }
}
