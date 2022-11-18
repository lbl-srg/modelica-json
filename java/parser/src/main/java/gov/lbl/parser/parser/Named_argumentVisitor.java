package gov.lbl.parser.parser;

import gov.lbl.parser.domain.Function_argument;
import gov.lbl.parser.domain.Named_argument;
import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;

public class Named_argumentVisitor extends modelicaBaseVisitor<Named_argument> {
    @Override
    public Named_argument visitNamed_argument(modelicaParser.Named_argumentContext ctx) {
        String identifier = ctx.IDENT() == null? "" : ctx.IDENT().getText();
        Function_argumentVisitor function_argumentVisitor = new Function_argumentVisitor();
        Function_argument value = ctx.function_argument().accept(function_argumentVisitor);
        return new Named_argument(identifier, value);
    }
}