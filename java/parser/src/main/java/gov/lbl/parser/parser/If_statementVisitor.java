package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.If_elseif_statement;
import gov.lbl.parser.domain.If_statement;
import gov.lbl.parser.domain.Statement;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class If_statementVisitor extends modelicaBaseVisitor<If_statement> {
    @Override
    public If_statement visitIf_statement(modelicaParser.If_statementContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> expressions = ctx.expression() == null ? null : ctx.expression()
                                                                            .stream()
                                                                            .map(condition -> condition.accept(expressionVisitor))
                                                                            .collect(toList());
        StatementVisitor statementVisitor = new StatementVisitor();
        List<Statement> statements = ctx.statement() == null ? null : ctx.statement()
                                                                                .stream()
                                                                                .map(statement -> statement.accept(statementVisitor))
                                                                                .collect(toList());

        int i=0;
        int expression_idx = 0;
        int statement_idx = 0;
        List<If_elseif_statement> if_elseif = new ArrayList<>();
        List<Statement> else_statement = null;
        while (i<ctx.getChildCount() && !ctx.getChild(i).getText().equalsIgnoreCase("end")) {
            if (ctx.getChild(i).getText().equals("if") || ctx.getChild(i).getText().equals("elseif")) {
                
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
                if_elseif.add(new If_elseif_statement(condition, then));
                statement_idx = statement_idx + (end_idx-start_idx)/2;
                i=end_idx;
            }
            else if (ctx.getChild(i).getText().equals("else")) {
                int start_idx = i+1;
                int end_idx = start_idx;
                for (int j=start_idx; j<ctx.getChildCount(); j++) {
                    if (!ctx.getChild(j).getText().equals(";") && ctx.getChild(j).getClass() != modelicaParser.StatementContext.class) {
                        end_idx = j;
                        break;
                    }
                }
                else_statement = statements.subList(statement_idx, statement_idx + (end_idx-start_idx)/2);
                statement_idx = statement_idx + (end_idx-start_idx)/2;
                i=end_idx;
            }
            else {
                i+=1;
            }
        }
        return new If_statement(if_elseif, else_statement);
    }
}