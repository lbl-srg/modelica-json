package gov.lbl.parser.domain;

import java.util.Collection;

public class When_equation {
    private Collection<When_elsewhen_equation> when_elsewhen;

    public When_equation(Collection<When_elsewhen_equation> when_elsewhen) {
        this.when_elsewhen = when_elsewhen;
    }
}
