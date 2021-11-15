package gov.lbl.parser.domain;

public class Element_modification_or_replaceable {
    private Boolean each;
    private Boolean is_final;
    private Element_modification element_modification;
    private Element_replaceable element_replaceable;

    public Element_modification_or_replaceable(Boolean each, Boolean is_final, Element_modification element_modification, Element_replaceable element_replaceable) {
        this.each = each;
        this.is_final = is_final;
        this.element_modification = element_modification;
        this.element_replaceable = element_replaceable;
    }
}
