package gov.lbl.parser.domain;

import java.util.Collection;

public class Component_list {
    Collection<Component_declaration> component_declaration_list;

    public Component_list(Collection<Component_declaration> component_declaration_list) throws Exception {
        if (component_declaration_list.size() == 0) {
            throw new Exception("component_list cannot be empty");
        }
        this.component_declaration_list = component_declaration_list;
    }
}
