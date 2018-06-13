package gov.lbl.parser.domain;

import java.util.Collection;

public class Element_list {
    private Collection<Element> element;

    public Element_list(Collection<Element> element) {
      this.element = (element.isEmpty() ? null : element); 
    }
}
