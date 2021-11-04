package gov.lbl.parser.domain;

import java.util.Collection;

public class Der_class_specifier {
    private String identifier;
    private Der_class_specifier_value der_class_specifier_value;

    public Der_class_specifier(String identifier, Der_class_specifier_value der_class_specifier_value) {
        this.identifier = identifier;
        this.der_class_specifier_value = der_class_specifier_value;
    }
}
