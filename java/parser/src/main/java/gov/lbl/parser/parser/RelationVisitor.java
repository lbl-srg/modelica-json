package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Relation;
import gov.lbl.parser.domain.Arithmetic_expression;

import static java.util.stream.Collectors.toList;

public class RelationVisitor extends modelicaBaseVisitor<Relation> {
    @Override
    public Relation visitRelation(modelicaParser.RelationContext ctx) {
        Arithmetic_expressionVisitor arithmetic_expressionVisitor = new Arithmetic_expressionVisitor();
        List<Arithmetic_expression> arithmetic_expressions = ctx.arithmetic_expression()
                .stream()
                .map(arithmetic_expression -> arithmetic_expression.accept(arithmetic_expressionVisitor))
                .collect(toList()); 
        Rel_opVisitor rel_opVisitor = new Rel_opVisitor();
        String rel_op = ctx.rel_op() == null ? "" : ctx.rel_op().accept(rel_opVisitor);  
        
        Arithmetic_expression arithmetic_expression1 = arithmetic_expressions.get(0);
        Arithmetic_expression arithmetic_expression2 = null;
        if (arithmetic_expressions.size() > 1) {
            arithmetic_expression2 = arithmetic_expressions.get(1);
        }
        
        return new Relation(arithmetic_expression1, rel_op, arithmetic_expression2);
    }
}