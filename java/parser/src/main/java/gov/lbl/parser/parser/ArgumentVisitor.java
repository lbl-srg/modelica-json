package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Argument;
import gov.lbl.parser.domain.Element_modification_or_replaceable;
import gov.lbl.parser.domain.Element_redeclaration;

public class ArgumentVisitor  extends modelicaBaseVisitor<Argument> {
    @Override
    public Argument visitArgument(modelicaParser.ArgumentContext ctx) {
        Element_modification_or_replaceableVisitor element_modification_or_replaceableVisitor = new Element_modification_or_replaceableVisitor();
        Element_modification_or_replaceable element_modification_or_replaceable = 
            ctx.element_modification_or_replaceable() == null ? null : ctx.element_modification_or_replaceable().accept(element_modification_or_replaceableVisitor);
        Element_redeclarationVisitor element_redeclarationVisitor = new Element_redeclarationVisitor();
        Element_redeclaration element_redeclaration = 
            ctx.element_redeclaration() == null ? null : ctx.element_redeclaration().accept(element_redeclarationVisitor);
        
        return new Argument(element_modification_or_replaceable, element_redeclaration);
    }
}