package gov.lbl.parser.domain;

import java.util.List;

public class Name {
    List<Name_part> name_parts;

    public Name(List<Name_part> name_parts) {
        this.name_parts = name_parts;
    }

    public List<Name_part> get_Name_parts() {
        return this.name_parts;
    }

    public String getName() {
        StringBuilder name = new StringBuilder();
        if (this.name_parts != null) {
            for (int j=0; j<this.name_parts.size(); j++) {
                if (this.name_parts.get(j).get_dot_op()) {
                    name.append(".");
                }
                name.append(this.name_parts.get(j).get_identifier());
            }
            return name.toString();
        }
        return "";
    }
}