package gov.lbl.parser.domain;

import java.util.Collection;

public class Primary {
    private Double unsigned_number;
    private String string;
    private Boolean is_false;
    private Boolean is_true;
    private Function_call_primary function_call_primary;
    private Component_reference component_reference;
    private Output_expression_list output_expression_list;
    private Collection<Expression_list> expression_lists;
    private Function_arguments function_arguments;

    public Primary(Double unsigned_number, String string, Boolean is_false, Boolean is_true, Function_call_primary function_call_primary, Component_reference component_reference,
                    Output_expression_list output_expression_list, Collection<Expression_list> expression_lists, Function_arguments function_arguments){
        this.unsigned_number = unsigned_number;
        this.string = string;
        this.is_false = is_false;
        this.is_true = is_true;
        this.function_call_primary = function_call_primary;
        this.component_reference = component_reference;
        this.output_expression_list = output_expression_list;
        this.expression_lists = expression_lists;
        this.function_arguments = function_arguments;
    }
}