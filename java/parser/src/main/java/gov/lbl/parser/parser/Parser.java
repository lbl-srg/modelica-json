package gov.lbl.parser.parser;

import gov.lbl.parser.domain.Stored_definition;

public interface Parser {
    Stored_definition parse(String modelicaSourceCode);
}
