package gov.lbl.parser.domain;

import java.util.Collection;

public class When_elsewhen_equation {
    private Expression condition;
    private Collection<Equation> then;

    public When_elsewhen_equation(Expression condition, Collection<Equation> then) {
        this.condition = condition;
        this.then = then;
    }

}
