package gov.lbl.parser.domain;

import gov.lbl.antlr4.visitor.modelicaParser.Component_referenceContext;

public class Assignment_statement {
    private Component_reference identifier;
    private Expression value;

    public Assignment_statement(Component_reference identifier, Expression value) {
        this.identifier = identifier;
        this.value = value;
    }
}
