package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.If_elseif_expression;
import gov.lbl.parser.domain.If_expression;
import gov.lbl.parser.domain.Simple_expression;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class ExpressionVisitor extends modelicaBaseVisitor<Expression> {
    @Override
    public Expression visitExpression(modelicaParser.ExpressionContext ctx) {
        Simple_expressionVisitor simple_expressionVisitor = new Simple_expressionVisitor();
        Simple_expression simple_expression = ctx.simple_expression() == null ? null : ctx.simple_expression().accept(simple_expressionVisitor);

        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> expressions = ctx.expression() == null ? null : ctx.expression()
                                                                            .stream()
                                                                            .map(expr -> expr.accept(expressionVisitor))
                                                                            .collect(toList());
        List<If_elseif_expression> if_elseif = new ArrayList<If_elseif_expression>();
        for (int i = 0; i<expressions.size() - 1; i+=2) {
            Expression condition = expressions.get(i);
            Expression then = expressions.get(i+1);
            if_elseif.add(new If_elseif_expression(condition, then));
        }
        // expressions always have else? 
        Expression else_expression = expressions.get(expressions.size()-1);

        If_expression if_expression = new If_expression(if_elseif, else_expression);
        return new Expression(simple_expression, if_expression);
    }
}
