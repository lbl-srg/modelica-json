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
        if (identifiers.size() == dots.size()+1) {
            name_parts.add(new Name_part(false, identifiers.get(0)));
        }

        for (int i=1; i<identifiers.size(); i++) {
            name_parts.add(new Name_part(dots.get(i-1).equals("."), identifiers.get(i)));
        }

        return new Name(name_parts);
    }

      // List<Name_part> name_parts = new ArrayList<Name_part>();
//         // for (int i=0; i<ident.size(); i++) {
//         //     Boolean dot_op = dots.get(i).equals(".");
//         //     String identifier = ident.get(i);
//         //     Name_part name_part = new Name_part(dot_op, identifier);
//         //     name_parts.add(name_part);
//         // }
//         return new Name(null);

    //   StringBuilder temStr = new StringBuilder();
    //   if (dots == null) {
    //   	temStr.append(ident.get(0));
    //   } else {
    //   	if (dots.size() == ident.size()) {
    //   		for (int i=0; i<ident.size(); i++) {
    //   			temStr.append(dots.get(i)).append(ident.get(i));
    //   		}
    //   	} else {
    //   		temStr.append(ident.get(0));
    //   		for (int i=1; i<ident.size(); i++) {
    //   			temStr.append(dots.get(i-1)).append(ident.get(i));
    //   		}
    //   	}
    //   }              
    //   return temStr.toString();
    //   //return new Name(dots, ident);
    // }
}