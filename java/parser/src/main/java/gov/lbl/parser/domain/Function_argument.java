package gov.lbl.parser.domain;

import java.util.Collection;

public class Function_argument {
    private Name function_name;
    private Collection<Named_argument> named_arguments;
    private Expression expression;

    public Function_argument(Name function_name, Collection<Named_argument> named_arguments, Expression expression) {
        this.function_name = function_name;
        this.named_arguments = named_arguments;
        this.expression = expression;
    }
}
