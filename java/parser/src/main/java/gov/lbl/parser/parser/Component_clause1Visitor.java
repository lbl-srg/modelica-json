package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_clause1;
import gov.lbl.parser.domain.Component_declaration1;
import gov.lbl.parser.domain.Type_specifier;

public class Component_clause1Visitor extends modelicaBaseVisitor<Component_clause1> {
    @Override
    public Component_clause1 visitComponent_clause1(modelicaParser.Component_clause1Context ctx) {
        Type_prefixVisitor type_prefixVisitor = new Type_prefixVisitor();
        String type_prefix = ctx.type_prefix().accept(type_prefixVisitor);

        Type_specifierVisitor type_specifierVisitor = new Type_specifierVisitor();
        Type_specifier type_specifier = ctx.type_specifier().accept(type_specifierVisitor);

        Component_declaration1Visitor component_declaration1Visitor = new Component_declaration1Visitor();
        Component_declaration1 component_declaration1 = ctx.component_declaration1().accept(component_declaration1Visitor);
        
        return new Component_clause1(type_prefix, type_specifier, component_declaration1);
    }
}