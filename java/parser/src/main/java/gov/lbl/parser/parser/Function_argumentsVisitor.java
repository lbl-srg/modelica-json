package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.For_indices;
import gov.lbl.parser.domain.Function_argument;
import gov.lbl.parser.domain.Function_arguments;
import gov.lbl.parser.domain.Named_arguments;

public class Function_argumentsVisitor extends modelicaBaseVisitor<Function_arguments> {
    @Override
    public Function_arguments visitFunction_arguments(modelicaParser.Function_argumentsContext ctx) {
        Named_argumentsVisitor named_argumentsVisitor = new Named_argumentsVisitor();
        Named_arguments named_arguments = ctx.named_arguments() == null ? null : ctx.named_arguments().accept(named_argumentsVisitor);

        Function_argumentVisitor function_argumentVisitor = new Function_argumentVisitor();
        Function_argument function_argument = ctx.function_argument() == null ? null : ctx.function_argument().accept(function_argumentVisitor);

        Function_argumentsVisitor function_argumentsVisitor = new Function_argumentsVisitor();
        Function_arguments function_arguments = ctx.function_arguments() == null ? null : ctx.function_arguments().accept(function_argumentsVisitor);

        For_indicesVisitor for_indicesVisitor = new For_indicesVisitor();
        For_indices for_indices = ctx.for_indices() == null ? null : ctx.for_indices().accept(for_indicesVisitor);
        
        return new Function_arguments(named_arguments, function_argument, for_indices, function_arguments);
    }
}