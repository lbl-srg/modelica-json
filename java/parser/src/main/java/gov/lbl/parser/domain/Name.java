package gov.lbl.parser.domain;

import java.util.Collection;

public class Name {
    Collection<Name_part> name_parts;

    public Name(Collection<Name_part> name_parts) {
        this.name_parts = name_parts;
    }
}
