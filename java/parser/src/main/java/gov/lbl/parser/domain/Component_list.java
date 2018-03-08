package gov.lbl.parser.domain;

import java.util.Collection;

public class Component_list {
    private Collection<Component_declaration> component_declaration;

    public Component_list(Collection<Component_declaration> component_declaration) {
      this.component_declaration = (component_declaration.size() > 0 ? component_declaration : null);
    }
}
