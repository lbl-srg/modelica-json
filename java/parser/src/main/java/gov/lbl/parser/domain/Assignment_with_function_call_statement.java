package gov.lbl.parser.domain;

public class Assignment_with_function_call_statement {
    private Output_expression_list output_expression_list;
    private Component_reference function_name;
    private Function_call_args function_call_args;

    public Assignment_with_function_call_statement(Output_expression_list output_expression_list, Component_reference function_name, Function_call_args function_call_args) {
        this.output_expression_list = output_expression_list;
        this.function_name = function_name;
        this.function_call_args = function_call_args;
    }
}
