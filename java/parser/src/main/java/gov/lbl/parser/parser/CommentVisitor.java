package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Annotation;
import gov.lbl.parser.domain.Comment;

public class CommentVisitor extends modelicaBaseVisitor<Comment> {
    @Override
    public Comment visitComment(modelicaParser.CommentContext ctx) {
        String_commentVisitor string_commentVisitor = new String_commentVisitor();
        String string_comment = ctx.string_comment() == null ? null : ctx.string_comment().accept(string_commentVisitor);
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        Annotation annotation = ctx.annotation() == null ? null : ctx.annotation().accept(annotationVisitor);
        return new Comment(string_comment, annotation);
    }
}
