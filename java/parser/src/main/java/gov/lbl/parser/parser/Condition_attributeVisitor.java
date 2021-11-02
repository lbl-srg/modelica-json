package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Condition_attribute;
import gov.lbl.parser.domain.Expression;

public class Condition_attributeVisitor extends modelicaBaseVisitor<Condition_attribute> {
    @Override
    public Condition_attribute visitCondition_attribute(modelicaParser.Condition_attributeContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression expression = ctx.expression() == null ? null :ctx.expression().accept(expressionVisitor);
        
        return new Condition_attribute(expression);
    }
}