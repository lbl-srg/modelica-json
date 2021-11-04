package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.Subscript;

public class SubscriptVisitor extends modelicaBaseVisitor<Subscript> {
    @Override
    public Subscript visitSubscript(modelicaParser.SubscriptContext ctx) {
        Boolean colon = ctx.SYMBOL_COLON() == null ? false : true;
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
    	Expression expression = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);

        return new Subscript(expression, colon);
    }
}