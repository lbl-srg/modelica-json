package gov.lbl.parser.domain;

import java.util.Collection;

public class Stored_definition {
    private Within within;
    private Collection<Class_definition> class_definition;

    public Stored_definition(Within within,
                             Collection<Class_definition> class_definition) {
      this.within = within;
      this.class_definition = (class_definition.size() > 0 ? class_definition : null);
    }
}
