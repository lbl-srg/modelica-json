package gov.lbl.parser.domain;

import java.util.Collection;

public class If_elseif_statement {
    private Expression condition;
    private Collection<Statement> then;

    public If_elseif_statement(Expression condition, Collection<Statement> then) {
        this.condition = condition;
        this.then = then;
    }
}
