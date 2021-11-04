package gov.lbl.parser.domain;

import java.util.Collection;

public class If_expression {
    private Collection<If_elseif_expression> if_elseif;
    private Expression else_expression;

    public If_expression(Collection<If_elseif_expression> if_elseif, Expression else_expression) {
        this.if_elseif = if_elseif;
        this.else_expression = else_expression;
    }
}