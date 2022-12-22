package gov.lbl.parser.domain;

import java.util.Collection;

public class If_statement {
    private Collection<If_elseif_statement> if_elseif;
    private Collection<Statement> else_statement;
    
    public If_statement(Collection<If_elseif_statement> if_elseif, Collection<Statement> else_statement) {
        this.if_elseif = if_elseif;
        this.else_statement = else_statement;
    }
}
