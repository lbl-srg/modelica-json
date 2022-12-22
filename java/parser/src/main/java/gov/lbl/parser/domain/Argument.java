package gov.lbl.parser.domain;

public class Argument {
    private Element_modification_or_replaceable element_modification_or_replaceable;
    private Element_redeclaration element_redeclaration;

    public Argument(Element_modification_or_replaceable element_modification_or_replaceable, Element_redeclaration element_redeclaration) {
        this.element_modification_or_replaceable = element_modification_or_replaceable;
        this.element_redeclaration = element_redeclaration;
    }
}
