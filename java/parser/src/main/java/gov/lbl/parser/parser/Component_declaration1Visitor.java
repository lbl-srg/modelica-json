package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Component_declaration1;
import gov.lbl.parser.domain.Declaration;

public class Component_declaration1Visitor extends modelicaBaseVisitor<Component_declaration1> {
    @Override
    public Component_declaration1 visitComponent_declaration1(modelicaParser.Component_declaration1Context ctx) {

        DeclarationVisitor declarationVisitor = new DeclarationVisitor();
        Declaration declaration = ctx.declaration() == null ? null : ctx.declaration().accept(declarationVisitor);

        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        
        return new Component_declaration1(declaration, comment);
    }
}