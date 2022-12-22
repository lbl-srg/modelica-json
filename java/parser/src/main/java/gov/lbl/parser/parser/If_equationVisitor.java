package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Equation;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.If_elseif_equation;
import gov.lbl.parser.domain.If_equation;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

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

        int i=0;
        int expression_idx = 0;
        int equation_idx = 0;
        List<If_elseif_equation> if_elseif = new ArrayList<>();
        List<Equation> else_equation = null;
        while (i<ctx.getChildCount() && !ctx.getChild(i).getText().equalsIgnoreCase("end")) {
            if (ctx.getChild(i).getText().equals("if") || ctx.getChild(i).getText().equals("elseif")) {
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
                if_elseif.add(new If_elseif_equation(condition, then));
                equation_idx = equation_idx + (end_idx-start_idx)/2;
                i=end_idx;
            }
            else if (ctx.getChild(i).getText().equals("else")) {
                int start_idx = i+1;
                int end_idx = start_idx;
                for (int j=start_idx; j<ctx.getChildCount(); j++) {
                    if (!ctx.getChild(j).getText().equals(";") && ctx.getChild(j).getClass() != modelicaParser.EquationContext.class) {
                        end_idx = j;
                        break;
                    }
                }
                else_equation = equations.subList(equation_idx, equation_idx + (end_idx-start_idx)/2);
                equation_idx = equation_idx + (end_idx-start_idx)/2;
                i=end_idx;
            }
            else {
                i+=1;
            }
        }
        return new If_equation(if_elseif, else_equation);
    }
}