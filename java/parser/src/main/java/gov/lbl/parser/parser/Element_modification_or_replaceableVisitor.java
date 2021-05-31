package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Element_modification;
import gov.lbl.parser.domain.Element_modification_or_replaceable;
import gov.lbl.parser.domain.Element_replaceable;

public class Element_modification_or_replaceableVisitor  extends modelicaBaseVisitor<Element_modification_or_replaceable> {
    @Override
    public Element_modification_or_replaceable visitElement_modification_or_replaceable(modelicaParser.Element_modification_or_replaceableContext ctx) {

        Boolean each = ctx.EACH() == null ? false : true;
        Boolean is_final = ctx.FINAL() == null ? false : true;

        Element_modificationVisitor element_modificationVisitor = new Element_modificationVisitor();
        Element_modification element_modification = ctx.element_modification() == null ? null : ctx.element_modification().accept(element_modificationVisitor);

        Element_replaceableVisitor element_replaceableVisitor = new Element_replaceableVisitor();
        Element_replaceable element_replaceable = ctx.element_replaceable() == null ? null : ctx.element_replaceable().accept(element_replaceableVisitor);
        
        return new Element_modification_or_replaceable(each, is_final, element_modification, element_replaceable);
    }
}