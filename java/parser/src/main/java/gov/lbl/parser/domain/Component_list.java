package gov.lbl.parser.domain;

import java.util.Collection;

public class Component_list {
    Collection<Component_declaration> component_declaration_list;

    public Component_list(Collection<Component_declaration> component_declaration_list) {
        this.component_declaration_list = component_declaration_list;
    }
}
