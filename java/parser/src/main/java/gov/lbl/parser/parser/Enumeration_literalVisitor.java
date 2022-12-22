package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Enumeration_literal;

public class Enumeration_literalVisitor  extends modelicaBaseVisitor<Enumeration_literal> {
    @Override
    public Enumeration_literal visitEnumeration_literal(modelicaParser.Enumeration_literalContext ctx) {
        String identifier = ctx.IDENT().getText();
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment().accept(commentVisitor);
        return new Enumeration_literal(identifier, comment);
    }
}