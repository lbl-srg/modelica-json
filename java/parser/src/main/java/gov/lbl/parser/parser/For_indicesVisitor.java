package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.For_index;
import gov.lbl.parser.domain.For_indices;

import static java.util.stream.Collectors.toList;

public class For_indicesVisitor extends modelicaBaseVisitor<For_indices> {
    @Override
    public For_indices visitFor_indices(modelicaParser.For_indicesContext ctx) {
        For_indexVisitor for_indexVisitor = new For_indexVisitor();
        List<For_index> indices = ctx.for_index()
                .stream()
                .map(for_index -> for_index.accept(for_indexVisitor))
                .collect(toList());
        return new For_indices(indices);
    }
}