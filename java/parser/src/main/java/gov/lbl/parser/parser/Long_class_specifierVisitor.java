package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_modification;
import gov.lbl.parser.domain.Composition;
import gov.lbl.parser.domain.Long_class_specifier;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class Long_class_specifierVisitor extends modelicaBaseVisitor<Long_class_specifier> {
    @Override
    public Long_class_specifier visitLong_class_specifier(modelicaParser.Long_class_specifierContext ctx) {
        List<String> idents = ctx.IDENT()
        		.stream()
        		.map(IDENT -> IDENT.getText())
        		.collect(toList());
        String identifier = idents.get(0);
        String extends_dec = ctx.EXTENDS() == null ? "" : ctx.EXTENDS().getText();
        Boolean is_extends = false;
        if (extends_dec.equals("extends")) {
            is_extends = true;
        }

        String_commentVisitor string_commentVisitor = new String_commentVisitor();
        String string_comment = ctx.string_comment().accept(string_commentVisitor);
        CompositionVisitor compositionVisitor = new CompositionVisitor();
        Composition composition = ctx.composition().accept(compositionVisitor);
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        Class_modification class_modification = ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        return new Long_class_specifier(identifier, string_comment, composition, is_extends, class_modification);
    }
}