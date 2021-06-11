package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Named_argument;
import gov.lbl.parser.domain.Named_arguments;

public class Named_argumentsVisitor extends modelicaBaseVisitor<Named_arguments> {
    @Override
    public Named_arguments visitNamed_arguments(modelicaParser.Named_argumentsContext ctx) {
        Named_argumentVisitor named_argumentVisitor = new Named_argumentVisitor();
        Named_argument named_argument = ctx.named_argument() == null ? null : ctx.named_argument().accept(named_argumentVisitor);

        Named_argumentsVisitor named_argumentsVisitor = new Named_argumentsVisitor();
        Named_arguments named_arguments = ctx.named_arguments() == null ? null : ctx.named_arguments().accept(named_argumentsVisitor);

        return new Named_arguments(named_argument, named_arguments);
    }
}