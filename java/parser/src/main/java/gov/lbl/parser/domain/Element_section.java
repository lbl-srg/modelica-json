package gov.lbl.parser.domain;

import java.util.Collection;

public class Element_section {
    private Element_list public_element_list;
    private Element_list protected_element_list;
    private Equation_section equation_section;
    private Algorithm_section algorithm_section;

    public Element_section(Element_list public_element_list, Element_list protected_element_list, 
                            Equation_section equation_section, Algorithm_section algorithm_sections) {
        this.public_element_list = public_element_list;
        this.protected_element_list = protected_element_list;
        this.equation_section = equation_section;
        this.algorithm_section = algorithm_sections;
    }
}
