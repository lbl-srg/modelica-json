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
        
        

        int i=0;
        int expression_idx = 0;
        int equation_idx = 0;
        List<When_elsewhen_equation> when_elsewhen = new ArrayList<When_elsewhen_equation>();
        while (i<ctx.getChildCount() && !ctx.getChild(i).getText().equalsIgnoreCase("end")) {
            if (ctx.getChild(i).getText().equals("when") || ctx.getChild(i).getText().equals("elsewhen")) {
                Expression condition = expressions.get(expression_idx);
                expression_idx+=1;
                int start_idx = i+3;
                int end_idx = start_idx;
                for (int j=start_idx; j<ctx.getChildCount(); j++) {
                    if (!ctx.getChild(j).getText().equals(";") && ctx.getChild(j).getClass() != modelicaParser.EquationContext.class) {
                        end_idx = j;
                        break;
                    }
                }
                
                List<Equation> then = equations.subList(equation_idx, equation_idx + (end_idx-start_idx)/2);
                when_elsewhen.add(new When_elsewhen_equation(condition, then));
                equation_idx = equation_idx + (end_idx-start_idx)/2;
                i=end_idx;
            }
            else {
                i+=1;
            }
        }

        return new When_equation(when_elsewhen);
    }
}