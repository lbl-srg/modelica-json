package gov.lbl.parser.domain;

public class Function_call_primary {
    private Name function_name;
    private Boolean der;
    private Boolean initial;
    private Function_call_args function_call_args;

    public Function_call_primary(Name function_name, Boolean der, Boolean initial, Function_call_args function_call_args) {
        this.function_name = function_name;
        this.der = der;
        this.initial = initial;
        this.function_call_args = function_call_args;
    }

}
