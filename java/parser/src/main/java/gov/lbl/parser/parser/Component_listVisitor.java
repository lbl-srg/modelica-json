package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Component_declaration;
import gov.lbl.parser.domain.Component_list;

import static java.util.stream.Collectors.toList;

public class Component_listVisitor extends modelicaBaseVisitor<Component_list> {
    @Override
    public Component_list visitComponent_list(modelicaParser.Component_listContext ctx) {
        Component_declarationVisitor component_declarationVisitor = new Component_declarationVisitor();
        List<Component_declaration> component_declaration_list = ctx.component_declaration()
                                                                    .stream()
                                                                    .map(component_declaration -> component_declaration.accept(component_declarationVisitor))
                                                                    .collect(toList());
        return new Component_list(component_declaration_list);
    }
}