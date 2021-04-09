package gov.lbl.parser.domain;

import java.util.Collection;

public class If_elseif_equation {
    private Expression condition;
    private Collection<Equation> then;

    public If_elseif_equation(Expression condition, Collection<Equation> then) {
        this.condition = condition;
        this.then = then;
    }
}
