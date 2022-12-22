package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Name;
import gov.lbl.parser.domain.Type_specifier;

public class Type_specifierVisitor  extends modelicaBaseVisitor<Type_specifier> {
    @Override
    public Type_specifier visitType_specifier(modelicaParser.Type_specifierContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        return new Type_specifier(name);
    }
}