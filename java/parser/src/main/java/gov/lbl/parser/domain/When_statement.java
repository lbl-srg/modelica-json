package gov.lbl.parser.domain;

import java.util.Collection;

public class When_statement {
    private Collection<When_elsewhen_statement> when_elsewhen;

    public When_statement(Collection<When_elsewhen_statement> when_elsewhen) {
        this.when_elsewhen = when_elsewhen;
    }
}
