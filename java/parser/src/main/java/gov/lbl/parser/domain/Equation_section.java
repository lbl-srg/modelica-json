package gov.lbl.parser.domain;

import java.util.Collection;

public class Equation_section {
    private Boolean initial;
    private Collection<Equation> equations;
    
    public Equation_section(Boolean initial, Collection<Equation> equations) {
        this.initial = initial;
        this.equations = equations;
    }
}
