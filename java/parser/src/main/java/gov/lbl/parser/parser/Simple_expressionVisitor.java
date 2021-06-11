package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Logical_expression;
import gov.lbl.parser.domain.Simple_expression;

import static java.util.stream.Collectors.toList;

public class Simple_expressionVisitor  extends modelicaBaseVisitor<Simple_expression> {
    @Override
    public Simple_expression visitSimple_expression(modelicaParser.Simple_expressionContext ctx) {
        Logical_expressionVisitor logical_expressionVisitor = new Logical_expressionVisitor();
        List<Logical_expression> logical_expressions = ctx.logical_expression() == null ? null : ctx.logical_expression()
                                                                                                        .stream()
                                                                                                        .map(log_expr -> log_expr.accept(logical_expressionVisitor))
                                                                                                        .collect(toList());

        Logical_expression logical_expression1 = logical_expressions.get(0);
        Logical_expression logical_expression2 = null;
        Logical_expression logical_expression3 = null;
        if (logical_expressions.size() > 1) {
            logical_expression2 = logical_expressions.get(1);
        }
        if (logical_expressions.size() > 2) {
            logical_expression3 = logical_expressions.get(2);
        }
        return new Simple_expression(logical_expression1, logical_expression2, logical_expression3);
    }
}