package gov.lbl.parser.domain;

import java.util.Collection;

public class If_elseif_expression {
    private Expression condition;
    private Expression then;

    public If_elseif_expression(Expression condition, Expression then) {
        this.condition = condition;
        this.then = then;
    }
}
