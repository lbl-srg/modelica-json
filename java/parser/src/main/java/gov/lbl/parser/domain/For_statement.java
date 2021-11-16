package gov.lbl.parser.domain;

import java.util.Collection;

public class For_statement {
    private For_indices for_indices;
    private Collection<Statement> loop_statements;

    public For_statement(For_indices for_indices, Collection<Statement> loop_statements) {
        this.for_indices = for_indices;
        this.loop_statements = loop_statements;
    }
}
