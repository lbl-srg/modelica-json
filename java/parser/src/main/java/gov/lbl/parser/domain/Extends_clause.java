package gov.lbl.parser.domain;

public class Extends_clause {
    private Name name;
    private Class_modification class_modification;
    private Annotation annotation;

    public Extends_clause(Name name, Class_modification class_modification, Annotation annotation) {
        this.name = name;
        this.class_modification = class_modification;
        this.annotation = annotation;
    }
}
