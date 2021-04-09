package gov.lbl.parser.domain;

import java.util.Collection;

public class Composition {
    private Element_list element_list;
    private Collection<Element_list> public_element_list;
    private Collection<Element_list> protected_element_list;
    private Collection<Equation_section> equation_section;
    private Collection<Algorithm_section> algorithm_section;
    private External_composition external_composition; 
    private Annotation annotation;

    public Composition(Element_list element_list, Collection<Element_list> public_element_list, Collection<Element_list> protected_element_list, Collection<Equation_section> equation_section, 
                        Collection<Algorithm_section> algorithm_section, External_composition external_composition, Annotation annotation) {
        this.element_list = element_list;
        this.public_element_list = (public_element_list.size() > 0) ? public_element_list : null;
        this.protected_element_list = (protected_element_list.size() > 0) ? protected_element_list : null;
        this.equation_section = (equation_section.size() > 0) ? equation_section : null;
        this.algorithm_section = (algorithm_section.size() > 0) ? algorithm_section : null;
        this.external_composition = external_composition;
        this.annotation = annotation;
    }
}