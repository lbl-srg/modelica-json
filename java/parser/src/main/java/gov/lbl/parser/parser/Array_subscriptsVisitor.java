package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Array_subscripts;
import gov.lbl.parser.domain.Subscript;

import static java.util.stream.Collectors.toList;


public class Array_subscriptsVisitor extends modelicaBaseVisitor<Array_subscripts> {
    @Override
    public Array_subscripts visitArray_subscripts(modelicaParser.Array_subscriptsContext ctx) {
        SubscriptVisitor subscriptVisitor = new SubscriptVisitor();
        List<Subscript> subscripts = ctx.subscript()
                .stream()
                .map(subscript -> subscript.accept(subscriptVisitor))
                .collect(toList());
        
        return new Array_subscripts(subscripts);
    }
}
