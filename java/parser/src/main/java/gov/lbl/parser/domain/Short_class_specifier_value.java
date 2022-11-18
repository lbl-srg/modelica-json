package gov.lbl.parser.domain;

public class Short_class_specifier_value {
    private Base_prefix base_prefix;
    private Name name;
    private Array_subscripts array_subscripts;
    private Class_modification class_modification;
    private Comment comment;
    private Enum_list enum_list;

    public Short_class_specifier_value(Base_prefix base_prefix, Name name, Array_subscripts array_subscripts,
            Class_modification class_modification, Comment comment, Enum_list enum_list) {
        this.base_prefix = base_prefix;
        this.name = name;
        this.array_subscripts = array_subscripts;
        this.class_modification = class_modification;
        this.comment = comment;
        this.enum_list = enum_list;
    }
}
