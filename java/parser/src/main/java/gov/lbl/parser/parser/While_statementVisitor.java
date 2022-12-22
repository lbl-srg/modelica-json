package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.Statement;
import gov.lbl.parser.domain.While_statement;

import static java.util.stream.Collectors.toList;

public class While_statementVisitor  extends modelicaBaseVisitor<While_statement> {
    @Override
    public While_statement visitWhile_statement(modelicaParser.While_statementContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression expression = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);

        StatementVisitor statementVisitor = new StatementVisitor();
        List<Statement> loop_statements = ctx.statement() == null ? null : ctx.statement()
                                                                                .stream()
                                                                                .map(stmt -> stmt.accept(statementVisitor))
                                                                                .collect(toList());
        return new While_statement(expression, loop_statements);
    }
}