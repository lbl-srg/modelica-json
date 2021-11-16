package gov.lbl.parser.domain;

public class Final_class_definition {
    private Boolean is_final;
    private Class_definition class_definition;

    public Final_class_definition(Boolean is_final, Class_definition class_definition) {
        this.is_final = is_final;
        this.class_definition = class_definition;
    }
}
