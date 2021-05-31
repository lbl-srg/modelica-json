package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.If_statement;

public class If_statementVisitor extends modelicaBaseVisitor<String> {
    @Override
    public String visitIf_statement(modelicaParser.If_statementContext ctx) {
        
        // String temStr = "";
        // if (ctx.getText().isEmpty()) {
        //     temStr = null;
        // } else {
        //     int a = ctx.start.getStartIndex();
        //     int b = ctx.stop.getStopIndex();
        //     Interval interval = new Interval(a,b);
        //     CharStream charStr = ctx.start.getInputStream();
        //     temStr = charStr.getText(interval).trim();
        // }
        return new If_statement(if_elseif, else_statement);
    }
}