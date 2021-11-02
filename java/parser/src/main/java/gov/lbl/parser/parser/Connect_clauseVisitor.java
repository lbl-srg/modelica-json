package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_reference;
import gov.lbl.parser.domain.Connect_clause;

import static java.util.stream.Collectors.toList;

public class Connect_clauseVisitor extends modelicaBaseVisitor<Connect_clause> {
    @Override
    public Connect_clause visitConnect_clause(modelicaParser.Connect_clauseContext ctx) {
        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        List<Component_reference> component_references = ctx.component_reference()
                .stream()
                .map(component_reference -> component_reference.accept(component_referenceVisitor))
                .collect(toList());

        Component_reference from = component_references.get(0);
        Component_reference to = component_references.get(1);
        return new Connect_clause(from, to);
    }
}