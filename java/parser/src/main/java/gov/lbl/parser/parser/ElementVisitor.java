package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_definition;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Component_clause;
import gov.lbl.parser.domain.Constraining_clause;
import gov.lbl.parser.domain.Element;
import gov.lbl.parser.domain.Extends_clause;
import gov.lbl.parser.domain.Import_clause;

public class ElementVisitor  extends modelicaBaseVisitor<Element> {
    @Override
    public Element visitElement(modelicaParser.ElementContext ctx) {
        Import_clauseVisitor import_clauseVisitor  = new Import_clauseVisitor();
        Import_clause import_clause = ctx.import_clause() == null ? null : ctx.import_clause().accept(import_clauseVisitor);
        
        Extends_clauseVisitor extends_clauseVisitor  = new Extends_clauseVisitor();
        Extends_clause extends_clause = ctx.extends_clause() == null ? null : ctx.extends_clause().accept(extends_clauseVisitor);

        Boolean redeclare = ctx.REDECLARE() == null ? false : true;
        Boolean is_final = ctx.FINAL() == null ? false : true;
        Boolean inner = ctx.INNER() == null ? false : true;
        Boolean outer = ctx.OUTER() == null ? false : true;
        Boolean replaceable = ctx.REPLACEABLE() == null ? false : true;
        
        Constraining_clauseVisitor constraining_clauseVisitor = new Constraining_clauseVisitor();
        Constraining_clause constraining_clause = ctx.constraining_clause() == null ? null : ctx.constraining_clause().accept(constraining_clauseVisitor);

        Class_definitionVisitor class_definitionVisitor = new Class_definitionVisitor();
        Class_definition class_definition = ctx.class_definition() == null ? null : ctx.class_definition().accept(class_definitionVisitor);

        Component_clauseVisitor component_clauseVisitor = new Component_clauseVisitor();
        Component_clause component_clause = ctx.component_clause() == null ? null : ctx.component_clause().accept(component_clauseVisitor); 

        CommentVisitor commentVisitor  = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        
        return new Element(import_clause, extends_clause, redeclare, is_final, inner, outer, replaceable, constraining_clause, class_definition, component_clause, comment);
    }
}