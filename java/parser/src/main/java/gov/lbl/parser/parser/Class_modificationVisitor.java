package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Argument_list;
import gov.lbl.parser.domain.Class_modification;

public class Class_modificationVisitor extends modelicaBaseVisitor<Class_modification> {
    @Override
    public Class_modification visitClass_modification(modelicaParser.Class_modificationContext ctx) {
        Argument_listVisitor argument_listVisitor = new Argument_listVisitor();
        Argument_list argument_list = ctx.argument_list().accept(argument_listVisitor);
        
        return new Class_modification(argument_list);
    }   
}