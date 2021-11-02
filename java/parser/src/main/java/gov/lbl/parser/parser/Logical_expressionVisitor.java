package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Logical_expression;
import gov.lbl.parser.domain.Logical_term;

import static java.util.stream.Collectors.toList;

public class Logical_expressionVisitor extends modelicaBaseVisitor<Logical_expression> {
    @Override
    public Logical_expression visitLogical_expression(modelicaParser.Logical_expressionContext ctx) {

        Logical_termVisitor logical_termVisitor = new Logical_termVisitor();
        List<Logical_term> logical_term_list = ctx.logical_term()
                .stream()
                .map(l_term -> l_term.accept(logical_termVisitor))
                .collect(toList());
        
        return new Logical_expression(logical_term_list);
    }
}