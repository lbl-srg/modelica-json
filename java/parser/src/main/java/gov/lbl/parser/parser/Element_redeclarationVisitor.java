package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_clause1;
import gov.lbl.parser.domain.Element_redeclaration;
import gov.lbl.parser.domain.Element_replaceable;
import gov.lbl.parser.domain.Short_class_definition;

public class Element_redeclarationVisitor extends modelicaBaseVisitor<Element_redeclaration> {
    @Override
    public Element_redeclaration visitElement_redeclaration(modelicaParser.Element_redeclarationContext ctx) {
        Boolean each = ctx.EACH() == null ? false : true;
        Boolean is_final = ctx.FINAL() == null ? false : true;

        Short_class_definitionVisitor short_class_definitionVisitor = new Short_class_definitionVisitor();
        Short_class_definition short_class_definition = ctx.short_class_definition() == null ? null : ctx.short_class_definition().accept(short_class_definitionVisitor);

        Component_clause1Visitor component_clause1Visitor = new Component_clause1Visitor();
        Component_clause1 component_clause1 = ctx.component_clause1() == null ? null : ctx.component_clause1().accept(component_clause1Visitor);

        Element_replaceableVisitor element_replaceableVisitor = new Element_replaceableVisitor();
        Element_replaceable element_replaceable = ctx.element_replaceable() == null ? null : ctx.element_replaceable().accept(element_replaceableVisitor);

        return new Element_redeclaration(each, is_final, short_class_definition, component_clause1, element_replaceable);
    }
}