package gov.lbl.parser.domain;

import java.util.Collection;

public class Function_arguments {
    private Collection<Named_argument> named_arguments;
    private Function_argument function_argument;
    private For_indices for_indices;
    private Function_arguments function_arguments;

    public Function_arguments(Collection<Named_argument> named_arguments, Function_argument function_argument, For_indices for_indices, Function_arguments function_arguments) {
        this.named_arguments = named_arguments;
        this.function_argument = function_argument;
        this.for_indices = for_indices;
        this.function_arguments = function_arguments;
    }
}
