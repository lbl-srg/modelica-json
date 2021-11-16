package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Array_subscripts;
import gov.lbl.parser.domain.Declaration;
import gov.lbl.parser.domain.Modification;

public class DeclarationVisitor extends modelicaBaseVisitor<Declaration> {
    @Override
    public Declaration visitDeclaration(modelicaParser.DeclarationContext ctx) {
        String identifier = ctx.IDENT().getText();
        
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        Array_subscripts array_subscripts = ctx.array_subscripts() == null ? null : ctx.array_subscripts().accept(array_subscriptsVisitor);
        
        ModificationVisitor modificationVisitor = new ModificationVisitor();
        Modification modification = ctx.modification() == null ? null : ctx.modification().accept(modificationVisitor);        
        
        return new Declaration(identifier, array_subscripts, modification);
    }
}