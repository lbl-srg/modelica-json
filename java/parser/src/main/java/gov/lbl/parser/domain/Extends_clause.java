package gov.lbl.parser.domain;

public class Extends_clause {
    private String name;
    private String class_modification;
    private String annotation;

    public Extends_clause(String ext_dec,
    		              String name,
    		              String class_modification,
    		              String annotation) {
      this.name = name;
      this.class_modification = (class_modification == null ? null : class_modification);
      this.annotation  = (annotation == null ? null : annotation);
    }
}
