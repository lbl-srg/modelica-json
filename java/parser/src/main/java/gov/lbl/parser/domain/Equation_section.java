package gov.lbl.parser.domain;

import java.util.Collection;

public class Equation_section {
    private Boolean initial;
    private Collection<Equation> equation;
    
    public Equation_section(Boolean initial, Collection<Equation> equation) {
        this.initial = initial;
        this.equation = equation;
    }
}
