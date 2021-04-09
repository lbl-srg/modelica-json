package gov.lbl.parser.domain;

import java.util.Collection;

public class For_equation {
    private For_indices for_indices;
    private Collection<Equation> loop_equations;

    public For_equation(For_indices for_indices, Collection<Equation> loop_equations) {
        this.for_indices = for_indices;
        this.loop_equations = loop_equations;
    }
}
