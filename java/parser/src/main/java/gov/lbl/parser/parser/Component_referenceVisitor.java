package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;

public class Component_referenceVisitor extends modelicaBaseVisitor<String> {
    @Override
    public String visitComponent_reference(modelicaParser.Component_referenceContext ctx) {
        String temStr = "";
        if (ctx.getText().isEmpty()) {
            temStr = null;
        } else {
            int a = ctx.start.getStartIndex();
                int b = ctx.stop.getStopIndex();
                Interval interval = new Interval(a,b);
                CharStream charStr = ctx.start.getInputStream();
                temStr = charStr.getText(interval).trim();
        }  	   
        return temStr;
        // return new Component_reference(ident, dots, array_subscripts_1);
    }
}