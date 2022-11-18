package gov.lbl.parser.parser;

import gov.lbl.parser.domain.Annotation;
import gov.lbl.parser.domain.Class_modification;
import gov.lbl.parser.domain.Extends_clause;
import gov.lbl.parser.domain.Name;
import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;

public class Extends_clauseVisitor extends modelicaBaseVisitor<Extends_clause> {
    @Override
    public Extends_clause visitExtends_clause(modelicaParser.Extends_clauseContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);

        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        Class_modification class_modification = ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        Annotation annotation = ctx.annotation() == null ? null : ctx.annotation().accept(annotationVisitor);      
        
        return new Extends_clause(name, class_modification, annotation);
    }
}