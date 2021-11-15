package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Name;
import gov.lbl.parser.domain.Name_part;
import static java.util.stream.Collectors.toList;
import java.util.ArrayList;

public class NameVisitor extends modelicaBaseVisitor<Name> {
    @Override
    public Name visitName(modelicaParser.NameContext ctx) {
        List<String> dots = ctx.SYMBOL_DOT()==null ? null : ctx.SYMBOL_DOT()
            .stream()
            .map(SYMBOL_DOT -> SYMBOL_DOT.getText())
            .collect(toList());
        List<String> identifiers = ctx.IDENT()
            .stream()
            .map(IDENT -> IDENT.getText())
            .collect(toList());

        List<Name_part> name_parts = new ArrayList<Name_part>();
        if (dots != null && identifiers != null) {
            if (identifiers.size() == dots.size()+1) {
                name_parts.add(new Name_part(false, identifiers.get(0)));
            }
            for (int i=1; i<identifiers.size(); i++) {
                name_parts.add(new Name_part(dots.get(i-1).equals("."), identifiers.get(i)));
            }
        }
        return new Name(name_parts);
    }
}