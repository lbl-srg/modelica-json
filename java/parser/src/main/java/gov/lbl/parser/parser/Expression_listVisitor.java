package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.Expression_list;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class Expression_listVisitor  extends modelicaBaseVisitor<Expression_list> {
    @Override
    public Expression_list visitExpression_list(modelicaParser.Expression_listContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> expressions = ctx.expression() == null ? null : ctx.expression()
                                                                                    .stream()
                                                                                    .map(expression -> expression.accept(expressionVisitor))
                                                                                    .collect(toList());
        return new Expression_list(expressions);
    }
}