package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_definition;
import gov.lbl.parser.domain.Class_specifier;

public class Class_definitionVisitor extends modelicaBaseVisitor<Class_definition> {
    @Override
    public Class_definition visitClass_definition(modelicaParser.Class_definitionContext ctx) {
        String enca_dec = ctx.ENCAPSULATED() == null ? "" : ctx.ENCAPSULATED().getText();

        Boolean encapsulated = false;
        if (enca_dec.equals("encapsulated")) {
            encapsulated = true;
        }
        
        Class_prefixesVisitor class_prefixesVisitor = new Class_prefixesVisitor();
        String class_prefixes = ctx.class_prefixes().accept(class_prefixesVisitor);

        Class_specifierVisitor class_specifierVisitor = new Class_specifierVisitor();
        Class_specifier class_specifier = ctx.class_specifier().accept(class_specifierVisitor);

        return new Class_definition(encapsulated, class_prefixes, class_specifier);
    }
}