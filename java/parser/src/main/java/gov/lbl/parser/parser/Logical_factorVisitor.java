package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Logical_factor;
import gov.lbl.parser.domain.Relation;

public class Logical_factorVisitor extends modelicaBaseVisitor<Logical_factor> {
    @Override
    public Logical_factor visitLogical_factor(modelicaParser.Logical_factorContext ctx) {
        Boolean not = ctx.NOT() == null ? false : true;
        RelationVisitor relationVisitor = new RelationVisitor();
        Relation relation = ctx.relation() == null ? null : ctx.relation().accept(relationVisitor);
        return new Logical_factor(not, relation);
    }
}