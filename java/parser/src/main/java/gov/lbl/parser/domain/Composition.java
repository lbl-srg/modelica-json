package gov.lbl.parser.domain;

import java.util.Collection;

public class Composition {
    private Element_list element_list;
    private Collection<Element_section> element_sections;
    private External_composition external_composition; 
    private Annotation annotation;

    // composition: list(composition_obj)
    // composition_obj {
    //     type: element_list/public_ele/proto... 
    //     json: {}
    // }

    public Composition(Element_list element_list, Collection<Element_section> element_sections, External_composition external_composition, Annotation annotation) {
        this.element_list = element_list;
        this.element_sections = (element_sections.size() > 0) ? element_sections : null;
        this.external_composition = external_composition;
        this.annotation = annotation;
    }
}