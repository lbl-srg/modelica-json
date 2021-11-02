package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Statement;
import gov.lbl.parser.domain.Algorithm_section;

import static java.util.stream.Collectors.toList;

public class Algorithm_sectionVisitor extends modelicaBaseVisitor<Algorithm_section> {
    @Override
    public Algorithm_section visitAlgorithm_section(modelicaParser.Algorithm_sectionContext ctx) {
        Boolean initial = ctx.INITIAL() == null ? false : true;

        StatementVisitor statementVisitor = new StatementVisitor();
        List<Statement> statements = ctx.statement() == null ? null : ctx.statement()
                                                                    .stream()
                                                                    .map(statement -> statement.accept(statementVisitor))
                                                                    .collect(toList());
        return new Algorithm_section(initial, statements);
    }
}