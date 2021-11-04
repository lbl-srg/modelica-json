package gov.lbl.parser.domain;

import java.util.Collection;

public class Logical_term {
    private Collection<Logical_factor> logical_factor_list;

    public Logical_term(Collection<Logical_factor> logical_factor_list) {
        this.logical_factor_list = logical_factor_list;
    }
}
