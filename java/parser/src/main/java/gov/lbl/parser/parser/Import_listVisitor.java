package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Import_list;

import static java.util.stream.Collectors.toList;

import java.util.List;

public class Import_listVisitor extends modelicaBaseVisitor<Import_list> {
    @Override
    public Import_list visitImport_list(modelicaParser.Import_listContext ctx) {
        List<String> identifier_list = ctx.IDENT() == null ? null : ctx.IDENT().stream().map(identifier -> identifier.getText()).collect(toList());;
        return new Import_list(identifier_list);
    }
}