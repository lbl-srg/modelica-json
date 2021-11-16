package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Array_subscripts;
import gov.lbl.parser.domain.Component_clause;
import gov.lbl.parser.domain.Component_list;
import gov.lbl.parser.domain.Type_specifier;

public class Component_clauseVisitor extends modelicaBaseVisitor<Component_clause> {
    @Override
    public Component_clause visitComponent_clause(modelicaParser.Component_clauseContext ctx) {
        Type_prefixVisitor type_prefixVisitor = new Type_prefixVisitor();
        String type_prefix = ctx.type_prefix() == null ? null : ctx.type_prefix().accept(type_prefixVisitor);
        
        Type_specifierVisitor type_specifierVisitor = new Type_specifierVisitor();
        Type_specifier type_specifier = ctx.type_specifier().accept(type_specifierVisitor);
        
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        Array_subscripts array_subscripts = ctx.array_subscripts() == null ? null : ctx.array_subscripts().accept(array_subscriptsVisitor);
        
        Component_listVisitor component_listVisitor = new Component_listVisitor();
        Component_list component_list = ctx.component_list().accept(component_listVisitor);
        
        return new Component_clause(type_prefix, type_specifier, array_subscripts, component_list);
    }
}