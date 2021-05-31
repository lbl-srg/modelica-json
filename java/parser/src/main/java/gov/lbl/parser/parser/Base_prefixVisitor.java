package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Base_prefix;

public class Base_prefixVisitor extends modelicaBaseVisitor<Base_prefix> {
    @Override
    public Base_prefix visitBase_prefix(modelicaParser.Base_prefixContext ctx) {
        Type_prefixVisitor type_prefixVisitor = new Type_prefixVisitor();
        String type_prefix = ctx.type_prefix().accept(type_prefixVisitor);
        return new Base_prefix(type_prefix);
    }
}
