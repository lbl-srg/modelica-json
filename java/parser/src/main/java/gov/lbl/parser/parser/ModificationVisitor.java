package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_modification;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.Modification;

public class ModificationVisitor extends modelicaBaseVisitor<Modification> {
    @Override
    public Modification visitModification(modelicaParser.ModificationContext ctx) {    	  
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        Class_modification class_modification = ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);

        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression expression = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
        
        Boolean equal = ctx.SYMBOL_EQUAL() == null ? false : true;
        Boolean colon_equal = ctx.SYMBOL_COLONEQUAL() == null ? false : true;

        return new Modification(class_modification, equal, colon_equal, expression);
    }
}