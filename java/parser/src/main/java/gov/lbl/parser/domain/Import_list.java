package gov.lbl.parser.domain;

import java.util.Collection;

public class Import_list {
    Collection<String> identifier_list;

    public Import_list (Collection<String> identifier_list) throws Exception{
        if (identifier_list.size() == 0) {
            throw new Exception("import_list cannot be empty");
        }
        this.identifier_list = identifier_list;
    }
}
