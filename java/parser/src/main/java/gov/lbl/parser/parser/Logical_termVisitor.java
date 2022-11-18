package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Logical_factor;
import gov.lbl.parser.domain.Logical_term;

import static java.util.stream.Collectors.toList;

public class Logical_termVisitor extends modelicaBaseVisitor<Logical_term> {
    @Override
    public Logical_term visitLogical_term(modelicaParser.Logical_termContext ctx) {
        Logical_factorVisitor logical_factorVisitor = new Logical_factorVisitor();
        List<Logical_factor> logical_factor_list = ctx.logical_factor()
                .stream()
                .map(logical_factor -> logical_factor.accept(logical_factorVisitor))
                .collect(toList());
        return new Logical_term(logical_factor_list);
    }
}