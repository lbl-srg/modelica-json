package gov.lbl.parser.domain;

import java.util.Collection;

public class Stored_definition {
    private String within;
    private Boolean is_final;
    private Collection<Class_definition> class_definition;

    public Stored_definition(String within, Boolean is_final, 
                             Collection<Class_definition> class_definition) {
      this.within = within;
      this.is_final = is_final;
      this.class_definition = (class_definition.size() > 0 ? class_definition : null);
    }
}
