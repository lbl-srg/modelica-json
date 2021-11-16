package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Annotation;
import gov.lbl.parser.domain.Class_modification;

public class AnnotationVisitor extends modelicaBaseVisitor<Annotation> {
    @Override
    public Annotation visitAnnotation(modelicaParser.AnnotationContext ctx) {
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        Class_modification class_modification = ctx.class_modification().accept(class_modificationVisitor);
        return new Annotation(class_modification);
    }
}