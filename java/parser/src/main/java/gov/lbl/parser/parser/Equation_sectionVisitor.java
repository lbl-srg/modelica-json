package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Equation;
import gov.lbl.parser.domain.Equation_section;

import static java.util.stream.Collectors.toList;

public class Equation_sectionVisitor extends modelicaBaseVisitor<Equation_section> {
    @Override
    public Equation_section visitEquation_section(modelicaParser.Equation_sectionContext ctx) {
        Boolean initial = ctx.INITIAL() == null ? false : true;

        EquationVisitor equationVisitor = new EquationVisitor();
        List<Equation> equations = ctx.equation() == null ? null : ctx.equation()
                                                                    .stream()
                                                                    .map(equation -> equation.accept(equationVisitor))
                                                                    .collect(toList());
        return new Equation_section(initial, equations);
    }
}