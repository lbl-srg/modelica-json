package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_reference;
import gov.lbl.parser.domain.Expression_list;
import gov.lbl.parser.domain.Function_arguments;
import gov.lbl.parser.domain.Function_call_args;
import gov.lbl.parser.domain.Function_call_primary;
import gov.lbl.parser.domain.Name;
import gov.lbl.parser.domain.Output_expression_list;
import gov.lbl.parser.domain.Primary;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class PrimaryVisitor  extends modelicaBaseVisitor<Primary> {
    @Override
    public Primary visitPrimary(modelicaParser.PrimaryContext ctx) {
        Double unsigned_number = ctx.UNSIGNED_NUMBER() == null ? null : Double.parseDouble(ctx.UNSIGNED_NUMBER().getText());
        String primary_string = ctx.STRING() == null ? null : ctx.STRING().getText();
        Boolean is_false = ctx.FALSE() == null ? false : true;
        Boolean is_true = ctx.TRUE() == null ? false : true;

        NameVisitor nameVisitor = new NameVisitor();
        Name function_name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        Boolean der = ctx.DER() == null ? false : true;
        Boolean initial = ctx.INITIAL() == null ? false : true;
        
        Function_call_argsVisitor function_call_argsVisitor = new Function_call_argsVisitor();
        Function_call_args function_call_args = ctx.function_call_args() == null ? null :ctx.function_call_args().accept(function_call_argsVisitor);
        Function_call_primary function_call_primary = new Function_call_primary(function_name, der, initial, function_call_args);

        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        Component_reference component_reference = ctx.component_reference() == null ? null : ctx.component_reference().accept(component_referenceVisitor);
        
        Output_expression_listVisitor output_expression_listVisitor = new Output_expression_listVisitor();
        Output_expression_list output_expression_list = ctx.output_expression_list() == null ? null : ctx.output_expression_list().accept(output_expression_listVisitor);
        
        Expression_listVisitor expression_listVisitor = new Expression_listVisitor();
        List<Expression_list> expression_lists = ctx.expression_list() == null ? null : ctx.expression_list()
            .stream()
            .map(expression_list -> expression_list.accept(expression_listVisitor))
            .collect(toList());
        
        Function_argumentsVisitor function_argumentsVisitor = new Function_argumentsVisitor();
        Function_arguments function_arguments = ctx.function_arguments() == null ? null : ctx.function_arguments().accept(function_argumentsVisitor);

        Boolean end = ctx.END() == null ? false : true;
        
        return new Primary(unsigned_number, primary_string, is_false, is_true, function_call_primary, component_reference, output_expression_list, expression_lists, function_arguments, end);
    }
}