package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Array_subscripts;
import gov.lbl.parser.domain.Base_prefix;
import gov.lbl.parser.domain.Class_modification;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Enum_list;
import gov.lbl.parser.domain.Name;
import gov.lbl.parser.domain.Short_class_specifier;
import gov.lbl.parser.domain.Short_class_specifier_value;

public class Short_class_specifierVisitor extends modelicaBaseVisitor<Short_class_specifier> {
    @Override
    public Short_class_specifier visitShort_class_specifier(modelicaParser.Short_class_specifierContext ctx) {
        String identifier = ctx.IDENT().getText();

        Base_prefixVisitor base_prefixVisitor = new Base_prefixVisitor();
        Base_prefix base_prefix = ctx.base_prefix() == null ? null : ctx.base_prefix().accept(base_prefixVisitor);
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        Array_subscripts array_subscripts = ctx.array_subscripts() == null ? null : ctx.array_subscripts().accept(array_subscriptsVisitor);
        NameVisitor nameVisitor = new NameVisitor();
        Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        Class_modification class_modification = ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        Enum_listVisitor enum_listVisitor = new Enum_listVisitor();
        Enum_list enum_list = ctx.enum_list() == null ? null : ctx.enum_list().accept(enum_listVisitor);
        
        Short_class_specifier_value short_class_specifier_value = new Short_class_specifier_value(base_prefix, name, array_subscripts, class_modification, comment, enum_list);

        return new Short_class_specifier(identifier, short_class_specifier_value);
    }
}