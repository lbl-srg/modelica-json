package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;

public class Rel_opVisitor  extends modelicaBaseVisitor<String> {
    @Override
    public String visitRel_op(modelicaParser.Rel_opContext ctx) {
        String rel_op = ctx == null ? "" : ctx.getText();
        return rel_op;
    }
}