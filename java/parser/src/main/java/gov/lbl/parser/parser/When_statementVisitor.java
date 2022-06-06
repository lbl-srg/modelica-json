package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Statement;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.When_elsewhen_statement;
import gov.lbl.parser.domain.When_statement;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class When_statementVisitor extends modelicaBaseVisitor<When_statement> {
    @Override
    public When_statement visitWhen_statement(modelicaParser.When_statementContext ctx) {  
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> expressions = ctx.expression() == null ? null : ctx.expression()
                                                                            .stream()
                                                                            .map(expr -> expr.accept(expressionVisitor))
                                                                            .collect(toList());
        StatementVisitor statementVisitor = new StatementVisitor();
        List<Statement> statements = ctx.statement() == null ? null : ctx.statement()
                                                                        .stream()
                                                                        .map(stmt -> stmt.accept(statementVisitor))
                                                                        .collect(toList());
        
        int i=0;
        int expression_idx = 0;
        int statement_idx = 0;
        List<When_elsewhen_statement> when_elsewhen = new ArrayList<When_elsewhen_statement>();   
        while (i<ctx.getChildCount() && !ctx.getChild(i).getText().equalsIgnoreCase("end")) {
            if (ctx.getChild(i).getText().equals("when") || ctx.getChild(i).getText().equals("elsewhen")) {
                
                Expression condition = expressions.get(expression_idx);
                expression_idx+=1;
                int start_idx = i+3;
                int end_idx = start_idx;
                for (int j=start_idx; j<ctx.getChildCount(); j++) {
                    if (!ctx.getChild(j).getText().equals(";") && ctx.getChild(j).getClass() != modelicaParser.StatementContext.class) {
                        end_idx = j;
                        break;
                    }
                }
                
                List<Statement> then = statements.subList(statement_idx, statement_idx + (end_idx-start_idx)/2);
                when_elsewhen.add(new When_elsewhen_statement(condition, then));
                statement_idx = statement_idx + (end_idx-start_idx)/2;
                i=end_idx;
            }
            else {
                i+=1;
            }
        }
        return new When_statement(when_elsewhen);
    }
}