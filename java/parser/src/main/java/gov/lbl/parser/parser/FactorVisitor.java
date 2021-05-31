package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Factor;
import gov.lbl.parser.domain.Primary;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class FactorVisitor extends modelicaBaseVisitor<Factor> {
    @Override
    public Factor visitFactor(modelicaParser.FactorContext ctx) {
        PrimaryVisitor primaryVisitor = new PrimaryVisitor();
        List<Primary> primarys = ctx.primary() == null ? null : ctx.primary()
                                                                .stream()
                                                                .map(primary -> primary.accept(primaryVisitor))
                                                                .collect(toList());
        
        String op = 
                ctx.SYMBOL_CARET()==null ? ctx.SYMBOL_DOTCARET().getText() : ctx.SYMBOL_CARET().getText();
        
        Primary primary1 = primarys.get(0);
        Primary primary2 = primarys.get(1);
        
        return new Factor(primary1, op, primary2);
    }
}