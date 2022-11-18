package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;

public class Type_prefixVisitor extends modelicaBaseVisitor<String> {
    @Override
    public String visitType_prefix(modelicaParser.Type_prefixContext ctx) {
        String flow_dec = ctx.FLOW() == null ? null : ctx.FLOW().getText();
        String stream_dec = ctx.STREAM() == null ? null : ctx.STREAM().getText();
        String disc_dec = ctx.DISCRETE() == null ? null : ctx.DISCRETE().getText();
        String par_dec = ctx.PARAMETER() == null ? null : ctx.PARAMETER().getText();
        String con_dec = ctx.CONSTANT() == null ? null : ctx.CONSTANT().getText();
        String in_dec = ctx.INPUT() == null ? null : ctx.INPUT().getText();
        String out_dec = ctx.OUTPUT() == null ? null : ctx.OUTPUT().getText();
        String prefix = (flow_dec != null) ? flow_dec 
                        : (stream_dec != null ? stream_dec
                            : (disc_dec != null ? disc_dec 
                                : (par_dec != null ? par_dec 
                                    : (con_dec != null ? con_dec
                                        : (in_dec != null ? in_dec
                                            : out_dec)))));
        return prefix;
    }
}