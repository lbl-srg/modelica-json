package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Element;
import gov.lbl.parser.domain.Element_list;

import static java.util.stream.Collectors.toList;

public class Element_listVisitor extends modelicaBaseVisitor<Element_list> {
    @Override
    public Element_list visitElement_list(modelicaParser.Element_listContext ctx) {
        ElementVisitor elementVisitor = new ElementVisitor();
        List<Element> elements = ctx.element() == null ? null : ctx.element()
                .stream()
                .map(element -> element.accept(elementVisitor))
                .collect(toList());
        return new Element_list(elements);
    }
}