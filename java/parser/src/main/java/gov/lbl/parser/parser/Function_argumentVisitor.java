package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.Function_argument;
import gov.lbl.parser.domain.Name;
import gov.lbl.parser.domain.Named_arguments;

public class Function_argumentVisitor extends modelicaBaseVisitor<Function_argument> {
    @Override
    public Function_argument visitFunction_argument(modelicaParser.Function_argumentContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        Name function_name = ctx.name() == null? null : ctx.name().accept(nameVisitor);

        Named_argumentsVisitor named_argumentsVisitor = new Named_argumentsVisitor();
        Named_arguments named_arguments = ctx.named_arguments() == null ? null : ctx.named_arguments().accept(named_argumentsVisitor);

        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression expression = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);

        return new Function_argument(function_name, named_arguments, expression);
    }
}