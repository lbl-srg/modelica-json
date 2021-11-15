package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Element_modification;
import gov.lbl.parser.domain.Modification;
import gov.lbl.parser.domain.Name;

public class Element_modificationVisitor extends modelicaBaseVisitor<Element_modification> {
    @Override
    public Element_modification visitElement_modification(modelicaParser.Element_modificationContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        
        ModificationVisitor modificationVisitor = new ModificationVisitor();
        Modification modification = ctx.modification() == null ? null : ctx.modification().accept(modificationVisitor);        

        String_commentVisitor string_commentVisitor = new String_commentVisitor();
        String string_comment = ctx.string_comment() == null ? null : ctx.string_comment().accept(string_commentVisitor);
        
        return new Element_modification(name, modification, string_comment);
    }
}