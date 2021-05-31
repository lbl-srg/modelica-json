package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_specifier;
import gov.lbl.parser.domain.Der_class_specifier;
import gov.lbl.parser.domain.Long_class_specifier;
import gov.lbl.parser.domain.Short_class_specifier;

public class Class_specifierVisitor  extends modelicaBaseVisitor<Class_specifier> {
    @Override
    public Class_specifier visitClass_specifier(modelicaParser.Class_specifierContext ctx) {
        Long_class_specifierVisitor long_class_specifierVisitor = new Long_class_specifierVisitor();
        Long_class_specifier long_class_specifier = 
            ctx.long_class_specifier() == null ? null : ctx.long_class_specifier().accept(long_class_specifierVisitor);
        Short_class_specifierVisitor short_class_specifierVisitor = new Short_class_specifierVisitor();
        Short_class_specifier short_class_specifier = 
            ctx.short_class_specifier() == null ? null : ctx.short_class_specifier().accept(short_class_specifierVisitor);
        Der_class_specifierVisitor der_class_specifierVisitor = new Der_class_specifierVisitor();
        Der_class_specifier der_class_specifier = 
            ctx.der_class_specifier() == null ? null : ctx.der_class_specifier().accept(der_class_specifierVisitor);
        return new Class_specifier(long_class_specifier, short_class_specifier, der_class_specifier);
    }
}