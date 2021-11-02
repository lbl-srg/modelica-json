package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.Output_expression_list;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class Output_expression_listVisitor  extends modelicaBaseVisitor<Output_expression_list> {
    @Override
    public Output_expression_list visitOutput_expression_list(modelicaParser.Output_expression_listContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<Expression> output_expressions = ctx.expression() == null ? null : ctx.expression()
                                                                                    .stream()
                                                                                    .map(expression -> expression.accept(expressionVisitor))
                                                                                    .collect(toList());
        return new Output_expression_list(output_expressions);
    }
}