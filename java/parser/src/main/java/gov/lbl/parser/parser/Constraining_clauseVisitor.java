package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_modification;
import gov.lbl.parser.domain.Constraining_clause;
import gov.lbl.parser.domain.Name;

public class Constraining_clauseVisitor extends modelicaBaseVisitor<Constraining_clause> {
    @Override
    public Constraining_clause visitConstraining_clause(modelicaParser.Constraining_clauseContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        Class_modification class_modification = ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);

        return new Constraining_clause(name, class_modification);
    }
}