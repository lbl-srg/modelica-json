package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Statement;
import gov.lbl.parser.domain.For_statement;
import gov.lbl.parser.domain.For_indices;

import static java.util.stream.Collectors.toList;

public class For_statementVisitor extends modelicaBaseVisitor<For_statement> {
    @Override
    public For_statement visitFor_statement(modelicaParser.For_statementContext ctx) {
        For_indicesVisitor for_indicesVisitor = new For_indicesVisitor();
        For_indices for_indices = ctx.for_indices() == null? null : ctx.for_indices().accept(for_indicesVisitor);

        StatementVisitor statementVisitor = new StatementVisitor();
        List<Statement> loop_statements = ctx.statement() == null ? null : ctx.statement()
                                                                                .stream()
                                                                                .map(stmt -> stmt.accept(statementVisitor))
                                                                                .collect(toList());
        return new For_statement(for_indices, loop_statements);
    }
}