package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_clause1;
import gov.lbl.parser.domain.Constraining_clause;
import gov.lbl.parser.domain.Element_replaceable;
import gov.lbl.parser.domain.Short_class_definition;

public class Element_replaceableVisitor extends modelicaBaseVisitor<Element_replaceable> {
    @Override
    public Element_replaceable visitElement_replaceable(modelicaParser.Element_replaceableContext ctx) {
        Short_class_definitionVisitor short_class_definitionVisitor = new Short_class_definitionVisitor();
        Short_class_definition short_class_definition = ctx.short_class_definition() == null ? null : ctx.short_class_definition().accept(short_class_definitionVisitor);
        
        Component_clause1Visitor component_clause1Visitor = new Component_clause1Visitor();
        Component_clause1 component_clause1 = ctx.component_clause1() == null ? null : ctx.component_clause1().accept(component_clause1Visitor);

        Constraining_clauseVisitor constraining_clauseVisitor = new Constraining_clauseVisitor();
        Constraining_clause constraining_clause = ctx.constraining_clause() == null ? null : ctx.constraining_clause().accept(constraining_clauseVisitor);
        
        return new Element_replaceable(short_class_definition, component_clause1, constraining_clause);
    }
}