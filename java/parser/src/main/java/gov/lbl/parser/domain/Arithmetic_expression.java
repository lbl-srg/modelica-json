package gov.lbl.parser.domain;

import java.util.Collection;

public class Arithmetic_expression {
    private Collection<Arithmetic_term> arithmetic_term_list;

    public Arithmetic_expression(Collection<Arithmetic_term> arithmetic_term_list) {
        this.arithmetic_term_list = arithmetic_term_list;
    }
}
