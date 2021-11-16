package gov.lbl.parser.domain;

public class Long_class_specifier {
    private String identifier;
	private String string_comment;
	private Composition composition;
	private Boolean is_extends;
	private Class_modification class_modification;

    public Long_class_specifier(String identifier, String string_comment, Composition composition, Boolean is_extends, Class_modification class_modification) {
        this.identifier = identifier;
        this.string_comment = string_comment;
        this.composition = composition;
        this.is_extends = is_extends;
        this.class_modification = class_modification;
    }
}
