package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Equation;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.If_equation;

import static java.util.stream.Collectors.toList;

public class If_equationVisitor extends modelicaBaseVisitor<If_equation> {   	
    @Override
    public If_equation visitIf_equation(modelicaParser.If_equationContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> expressions = ctx.expression() == null ? null : ctx.expression()
                                                                            .stream()
                                                                            .map(condition -> condition.accept(expressionVisitor))
                                                                            .collect(toList());
        EquationVisitor equationVisitor = new EquationVisitor();
        List<Equation> equations = ctx.equation() == null ? null : ctx.equation()
                                                                                .stream()
                                                                                .map(equation -> equation.accept(equationVisitor))
                                                                                .collect(toList());
        Boolean else_condition = ctx.ELSE() == null ? false : true;
        Equation else_equation = null;
        if (else_condition) {
            else_equation = equations.get(equations.size() - 1);
        }
        
        // List<Eq

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
        return new If_equation(null, null);
    }
}