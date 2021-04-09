package gov.lbl.parser.domain;

import java.util.Collection;

public class Term {
    private Factor initial_factor;
    private Collection<Remaining_factor> remaining_factors;

    public Term(Factor initial_factor, Collection<Remaining_factor> remaining_factors) {
        this.initial_factor = initial_factor;
        this.remaining_factors = remaining_factors;
    }
}
