package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Equation;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.When_elsewhen_equation;
import gov.lbl.parser.domain.When_equation;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class When_equationVisitor extends modelicaBaseVisitor<When_equation> {
    @Override
    public When_equation visitWhen_equation(modelicaParser.When_equationContext ctx) {  
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> expressions = ctx.expression() == null ? null : ctx.expression()
                                                                            .stream()
                                                                            .map(expr -> expr.accept(expressionVisitor))
                                                                            .collect(toList());
        EquationVisitor equationVisitor = new EquationVisitor();
        List<Equation> equations = ctx.equation() == null ? null : ctx.equation()
                                                                        .stream()
                                                                        .map(eqn -> eqn.accept(equationVisitor))
                                                                        .collect(toList());
        
        List<When_elsewhen_equation> when_elsewhen = new ArrayList<When_elsewhen_equation>();
        if (expressions != null) {
            for (int i = 0; i< expressions.size(); i++) {

                //check? 
                when_elsewhen.add(new When_elsewhen_equation(expressions.get(i), equations.subList(i, i+1)));
            }
        }

        return new When_equation(when_elsewhen);
    }
}