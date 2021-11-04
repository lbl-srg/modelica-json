package gov.lbl.parser.domain;

public class Modification {
    private Class_modification class_modification;
    private Boolean equal;
    private Boolean colon_equal;
    private Expression expression;

    public Modification(Class_modification class_modification, Boolean equal, Boolean colon_equal, Expression expression) {
        this.class_modification = class_modification;
        this.equal = equal;
        this.colon_equal = colon_equal;
        this.expression = expression;
    }
}
