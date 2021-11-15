package gov.lbl.parser.domain;

import java.util.Collection;

public class If_equation {
    private Collection<If_elseif_equation> if_elseif;
    private Collection<Equation> else_equation;
    
    public If_equation(Collection<If_elseif_equation> if_elseif, Collection<Equation> else_equation) {
        this.if_elseif = if_elseif;
        this.else_equation = else_equation;
    }
}
