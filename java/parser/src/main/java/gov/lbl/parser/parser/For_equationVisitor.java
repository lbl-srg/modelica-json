package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Equation;
import gov.lbl.parser.domain.For_equation;
import gov.lbl.parser.domain.For_indices;

import static java.util.stream.Collectors.toList;

public class For_equationVisitor extends modelicaBaseVisitor<For_equation> {
    @Override
    public For_equation visitFor_equation(modelicaParser.For_equationContext ctx) {
        For_indicesVisitor for_indicesVisitor = new For_indicesVisitor();
        For_indices for_indices = ctx.for_indices() == null? null : ctx.for_indices().accept(for_indicesVisitor);

        EquationVisitor equationVisitor = new EquationVisitor();
        List<Equation> loop_equations = ctx.equation() == null ? null : ctx.equation()
                                                                                .stream()
                                                                                .map(eqn -> eqn.accept(equationVisitor))
                                                                                .collect(toList());
        return new For_equation(for_indices, loop_equations);
    }
}