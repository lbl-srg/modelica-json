package gov.lbl.parser.domain;

import java.util.Collection;

public class When_elsewhen_statement {
    private Expression condition;
    private Collection<Statement> then;

    public When_elsewhen_statement(Expression condition, Collection<Statement> then) {
        this.condition = condition;
        this.then = then;
    }

}
