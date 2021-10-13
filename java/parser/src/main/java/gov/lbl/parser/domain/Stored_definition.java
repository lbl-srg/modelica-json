package gov.lbl.parser.domain;

import java.util.Collection;

public class Stored_definition {
    private String within;
    private Collection<Final_class_definition> final_class_definitions;

    public Stored_definition(String within, Collection<Final_class_definition> final_class_definitions) {
      this.within = within;
      this.final_class_definitions = final_class_definitions;
    }
}
