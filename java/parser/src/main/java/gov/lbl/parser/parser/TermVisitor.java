package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Factor;
import gov.lbl.parser.domain.Term;

import static java.util.stream.Collectors.toList;

public class TermVisitor  extends modelicaBaseVisitor<Term> {
    @Override
    public Term visitTerm(modelicaParser.TermContext ctx) {
        List<String> mul_ops = ctx.mul_op() == null ? null : ctx.mul_op()
                .stream()
                .map(mul_op -> mul_op.getText())
                .collect(toList());
        FactorVisitor factorVisitor = new FactorVisitor();
        List<Factor> factors = ctx.factor() == null ? null : ctx.factor()
                .stream()
                .map(factor -> factor.accept(factorVisitor))
                .collect(toList());
        return new Term(factors, mul_ops);
    }
}