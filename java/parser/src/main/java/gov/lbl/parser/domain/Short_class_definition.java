package gov.lbl.parser.domain;

public class Short_class_definition {
    private String class_prefixes;
    private Short_class_specifier short_class_specifier;

    public Short_class_definition(String class_prefixes, Short_class_specifier short_class_specifier) {
        this.class_prefixes = class_prefixes;
        this.short_class_specifier = short_class_specifier;
    }
}
