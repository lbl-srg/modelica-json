package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_reference;
import gov.lbl.parser.domain.Expression_list;
import gov.lbl.parser.domain.External_function_call;
import gov.lbl.antlr4.visitor.modelicaBaseVisitor;

public class External_function_callVisitor extends modelicaBaseVisitor<External_function_call> {
    @Override
    public External_function_call visitExternal_function_call(modelicaParser.External_function_callContext ctx) {
        String identifier = ctx.IDENT().getText();
        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        Component_reference component_reference = 
                ctx.component_reference() == null ? null : ctx.component_reference().accept(component_referenceVisitor);
        Expression_listVisitor expression_listVisitor = new Expression_listVisitor();
        Expression_list expression_list = 
                ctx.expression_list() == null ? null : ctx.expression_list().accept(expression_listVisitor);
        return new External_function_call(component_reference, identifier, expression_list);
    }
}