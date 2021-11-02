package gov.lbl.parser.domain;

public class Function_call_equation {
    private Name function_name;
    private Function_call_args function_call_args;

    public Function_call_equation(Name function_name, Function_call_args function_call_args) {
        this.function_name = function_name;
        this.function_call_args = function_call_args;
    }
}
