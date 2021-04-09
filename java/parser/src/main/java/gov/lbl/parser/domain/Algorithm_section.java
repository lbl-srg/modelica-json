package gov.lbl.parser.domain;

import java.util.Collection;

public class Algorithm_section {
    private Boolean initial;
    private Collection<Statement> statement;

    public Algorithm_section(Boolean initial, Collection<Statement> statement) {
        this.initial = initial;
        this.statement = statement;
    }
}
