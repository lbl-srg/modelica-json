package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Component_declaration;
import gov.lbl.parser.domain.Condition_attribute;
import gov.lbl.parser.domain.Declaration;

public class Component_declarationVisitor extends modelicaBaseVisitor<Component_declaration> {
    @Override
    public Component_declaration visitComponent_declaration(modelicaParser.Component_declarationContext ctx) {
        DeclarationVisitor declarationVisitor = new DeclarationVisitor();
        Declaration declaration = ctx.declaration().accept(declarationVisitor);
        Condition_attributeVisitor condition_attributeVisitor = new Condition_attributeVisitor();
        Condition_attribute condition_attribute = ctx.condition_attribute() == null ? null : ctx.condition_attribute().accept(condition_attributeVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        return new Component_declaration(declaration, condition_attribute, comment);
    }
}