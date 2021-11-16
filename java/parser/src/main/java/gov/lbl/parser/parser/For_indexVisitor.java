package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.For_index;

public class For_indexVisitor extends modelicaBaseVisitor<For_index> {
    @Override
    public For_index visitFor_index(modelicaParser.For_indexContext ctx) {
        String identifier = ctx.IDENT().getText();
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression expression = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
        return new For_index(identifier, expression);
    }
}