package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Arithmetic_expression;
import gov.lbl.parser.domain.Arithmetic_term;
import gov.lbl.parser.domain.Term;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class Arithmetic_expressionVisitor extends modelicaBaseVisitor<Arithmetic_expression> {
    @Override
    public Arithmetic_expression visitArithmetic_expression(modelicaParser.Arithmetic_expressionContext ctx) {
        TermVisitor termVisitor = new TermVisitor();
        List<Term> terms = ctx.term() == null ? null : ctx.term()
                                                            .stream()
                                                            .map(t -> t.accept(termVisitor))
                                                            .collect(toList());

        List<String> add_ops = ctx.add_op() == null ? null : ctx.add_op()
                .stream()
                .map(add_op -> add_op.getText())
                .collect(toList());  
        
        List<Arithmetic_term> arithmetic_term_list = new ArrayList<Arithmetic_term>();
        if (terms != null && add_ops != null) {
            if (add_ops.size() == (terms.size() - 1)) {
                arithmetic_term_list.add(new Arithmetic_term(null, terms.get(0)));
            }
            for (int i=0; i<add_ops.size(); i++ ) {
                arithmetic_term_list.add(new Arithmetic_term(add_ops.get(i), terms.get(i)));
            }
        }
        return new Arithmetic_expression(arithmetic_term_list);
    }
}