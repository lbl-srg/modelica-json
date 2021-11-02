package gov.lbl.parser.domain;

import gov.lbl.antlr4.visitor.modelicaParser.Class_modificationContext;

public class Constraining_clause {
    private Name name;
    private Class_modification class_modification;

    public Constraining_clause(Name name, Class_modification class_modification) {
        this.name = name;
        this.class_modification = class_modification;
    }
}
