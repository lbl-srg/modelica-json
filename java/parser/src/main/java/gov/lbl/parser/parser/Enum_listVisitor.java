package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Enum_list;
import gov.lbl.parser.domain.Enumeration_literal;
import static java.util.stream.Collectors.toList;

import java.util.List;

public class Enum_listVisitor extends modelicaBaseVisitor<Enum_list> {
    @Override
    public Enum_list visitEnum_list(modelicaParser.Enum_listContext ctx) {
        Enumeration_literalVisitor enumeration_literalVisitor = new Enumeration_literalVisitor();
        List<Enumeration_literal> enumeration_literal_list = ctx.enumeration_literal().stream().map(enumeration_literal -> enumeration_literalVisitor.visitEnumeration_literal(enumeration_literal)).collect(toList());
        return new Enum_list(enumeration_literal_list);
    }
}
