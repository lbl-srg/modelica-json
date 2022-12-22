package gov.lbl.parser.domain;

import java.util.List;

public class Der_class_specifier_value {
    private Name type_specifier;
    private List<String> identifiers;
    private Comment comment;

    public Der_class_specifier_value(Name type_specifier, List<String> identifiers, Comment comment) {
        this.type_specifier = type_specifier;
        this.identifiers = identifiers;
        this.comment = comment;
    }
}
