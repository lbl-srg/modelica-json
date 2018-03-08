package gov.lbl.parser.domain;

import java.util.Collection;

public class Stored_definition {
    private Collection<String> within;
    private Collection<String> prefix;
    private Collection<Class_definition> class_definition;

    public Stored_definition(Collection<String> within_dec,
                             Collection<String> final_dec,
                             Collection<String> name,
                             Collection<Class_definition> class_definition) {
      this.within = (name.size()>0 ? name : null);
      this.prefix = (final_dec.size() > 0 ? final_dec : null);
      this.class_definition = (class_definition.size() > 0 ? class_definition : null);
    }
}
