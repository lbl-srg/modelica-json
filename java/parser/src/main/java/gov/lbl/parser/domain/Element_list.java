package gov.lbl.parser.domain;

import java.util.Collection;

public class Element_list {
    private Collection<Element> elements;
    
    public Element_list(Collection<Element> elements) {
        this.elements = elements.size() > 0 ? elements : null;
    }
}
