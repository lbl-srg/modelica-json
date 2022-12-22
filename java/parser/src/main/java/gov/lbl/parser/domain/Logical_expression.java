package gov.lbl.parser.domain;

import java.util.Collection;

public class Logical_expression {
    private Collection<Logical_term> logical_term_list;

    public Logical_expression(Collection<Logical_term> logical_term_list) {
        this.logical_term_list = logical_term_list;
    }
}
