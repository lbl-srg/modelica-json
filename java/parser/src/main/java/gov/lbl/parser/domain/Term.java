package gov.lbl.parser.domain;

import java.util.Collection;

public class Term {
    private Collection<Factor> factors;
    private Collection<String> mul_ops;

    public Term(Collection<Factor> factors, Collection<String> mul_ops) {
        this.factors = factors;
        this.mul_ops = mul_ops;
    }
}
