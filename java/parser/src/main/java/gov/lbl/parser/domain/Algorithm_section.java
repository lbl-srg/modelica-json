package gov.lbl.parser.domain;

import java.util.Collection;

public class Algorithm_section {
    private Boolean initial;
    private Collection<Statement> statements;

    public Algorithm_section(Boolean initial, Collection<Statement> statements) {
        this.initial = initial;
        this.statements = statements;
    }
}
