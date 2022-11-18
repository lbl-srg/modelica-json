package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Import_clause;
import gov.lbl.parser.domain.Import_list;
import gov.lbl.parser.domain.Name;

public class Import_clauseVisitor extends modelicaBaseVisitor<Import_clause> {
    @Override
    public Import_clause visitImport_clause(modelicaParser.Import_clauseContext ctx) {
        
        String identifier = ctx.IDENT() == null ? "" : ctx.IDENT().getText();
        
        NameVisitor nameVisitor = new NameVisitor();
        Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        
        Boolean dot_star = ctx.SYMBOL_DOTSTAR() == null ? false : true;

        Import_listVisitor import_listVisitor = new Import_listVisitor();
        Import_list import_list = ctx.import_list() == null ? null : ctx.import_list().accept(import_listVisitor);
        
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);

        return new Import_clause(identifier, name, dot_star, import_list, comment);
    }
}