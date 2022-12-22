package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.List;

public class While_statement {
    private Expression expression;   
    private Collection<Statement> loop_statements;

    public While_statement(Expression expression, Collection<Statement> loop_statements) {
        this.expression = expression;
        this.loop_statements = loop_statements;
    }
}