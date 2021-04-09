package gov.lbl.parser.domain;

import java.util.Collection;

public class Der_class_specifier_value {
    private Name type_specifier;
    private Collection<String> identifiers;
    private Comment comment;

    public Der_class_specifier_value(Name type_specifier, Collection<String> identifiers, Comment comment) throws Exception {
        this.type_specifier = type_specifier;
        if (identifiers.size() == 0) {
            throw new Exception("Der_class_specifier_value identifiers cannot be empty");
        }
        this.identifiers = identifiers;
        this.comment = comment;
    }
}
