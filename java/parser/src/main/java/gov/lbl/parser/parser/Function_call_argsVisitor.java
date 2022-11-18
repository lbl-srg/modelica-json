package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Function_arguments;
import gov.lbl.parser.domain.Function_call_args;

public class Function_call_argsVisitor extends modelicaBaseVisitor<Function_call_args> {
    @Override
    public Function_call_args visitFunction_call_args(modelicaParser.Function_call_argsContext ctx) {
        Function_argumentsVisitor function_argumentsVisitor = new Function_argumentsVisitor();
        Function_arguments function_arguments = ctx.function_arguments() == null ? null : ctx.function_arguments().accept(function_argumentsVisitor);
        return new Function_call_args(function_arguments);
    }
}