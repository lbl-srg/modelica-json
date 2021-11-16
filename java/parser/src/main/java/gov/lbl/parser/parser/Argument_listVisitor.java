package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Argument;
import gov.lbl.parser.domain.Argument_list;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class Argument_listVisitor extends modelicaBaseVisitor<Argument_list> {
    @Override
    public Argument_list visitArgument_list(modelicaParser.Argument_listContext ctx) {

        ArgumentVisitor argumentVisitor = new ArgumentVisitor();
        List<Argument> arguments = ctx.argument() == null ? null : ctx.argument()
                                                                        .stream()
                                                                        .map(argument -> argument.accept(argumentVisitor))
                                                                        .collect(toList());
        return new Argument_list(arguments);
    }
}