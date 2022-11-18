package gov.lbl.parser.domain;

import java.util.Collection;

public class Component_reference {
    private Collection<Component_reference_part> component_reference_parts;

    public Component_reference(Collection<Component_reference_part> component_reference_parts) {
        this.component_reference_parts = component_reference_parts;
    }
}
