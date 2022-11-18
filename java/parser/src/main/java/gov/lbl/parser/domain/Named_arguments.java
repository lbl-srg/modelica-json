package gov.lbl.parser.domain;

import java.util.Collection;

public class Named_arguments {
    
    private Named_argument named_argument;
    private Named_arguments named_arguments;

    public Named_arguments(Named_argument named_argument, Named_arguments named_arguments) {
        this.named_argument = named_argument;
        this.named_arguments = named_arguments;
    }
    
}
