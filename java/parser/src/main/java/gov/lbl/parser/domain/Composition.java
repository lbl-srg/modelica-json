package gov.lbl.parser.domain;

import java.util.Collection;

public class Composition {
    private Element_list element_list;
    private Collection<Element_list> public_element_lists;
    private Collection<Element_list> protected_element_lists;
    private Collection<Equation_section> equation_sections;
    private Collection<Algorithm_section> algorithm_sections;
    private External_composition external_composition; 
    private Annotation annotation;

    public Composition(Element_list element_list, Collection<Element_list> public_element_lists, Collection<Element_list> protected_element_lists, Collection<Equation_section> equation_sections, 
                        Collection<Algorithm_section> algorithm_sections, External_composition external_composition, Annotation annotation) {
        this.element_list = element_list;
        this.public_element_lists = (public_element_lists.size() > 0) ? public_element_lists : null;
        this.protected_element_lists = (protected_element_lists.size() > 0) ? protected_element_lists : null;
        this.equation_sections = (equation_sections.size() > 0) ? equation_sections : null;
        this.algorithm_sections = (algorithm_sections.size() > 0) ? algorithm_sections : null;
        this.external_composition = external_composition;
        this.annotation = annotation;
    }
}