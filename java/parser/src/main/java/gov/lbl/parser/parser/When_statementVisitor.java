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
        
        List<When_elsewhen_statement> when_elsewhen = new ArrayList<When_elsewhen_statement>();    
        for (int i = 0; i< expressions.size(); i++) {

            //check? 
            when_elsewhen.add(new When_elsewhen_statement(expressions.get(i), statements.subList(i, i+1)));
        }

        return new When_statement(when_elsewhen);
    }
}