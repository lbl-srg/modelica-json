package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Short_class_definition;
import gov.lbl.parser.domain.Short_class_specifier;

public class Short_class_definitionVisitor extends modelicaBaseVisitor<Short_class_definition> {
    @Override
    public Short_class_definition visitShort_class_definition(modelicaParser.Short_class_definitionContext ctx) {
        Class_prefixesVisitor class_prefixesVisitor = new Class_prefixesVisitor();
        String class_prefixes = ctx.class_prefixes().accept(class_prefixesVisitor);
        
        Short_class_specifierVisitor short_class_specifierVisitor = new Short_class_specifierVisitor();
        Short_class_specifier short_class_specifier = ctx.short_class_specifier().accept(short_class_specifierVisitor);
        
        return new Short_class_definition(class_prefixes, short_class_specifier);
    }
}