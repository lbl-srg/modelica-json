package gov.lbl.parser.domain;

public class Function_call_statement {
    private Component_reference function_name;
    private Function_call_args function_call_args;

    public Function_call_statement(Component_reference function_name, Function_call_args function_call_args) {
        this.function_name = function_name;
        this.function_call_args = function_call_args;
    }
}
