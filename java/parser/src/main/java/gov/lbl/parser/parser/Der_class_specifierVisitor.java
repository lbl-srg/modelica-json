package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Der_class_specifier;
import gov.lbl.parser.domain.Der_class_specifier_value;
import gov.lbl.parser.domain.Name;

import static java.util.stream.Collectors.toList;

public class Der_class_specifierVisitor extends modelicaBaseVisitor<Der_class_specifier> {
    @Override
    public Der_class_specifier visitDer_class_specifier(modelicaParser.Der_class_specifierContext ctx) {
        List<String> idents = ctx.IDENT()
            .stream()
            .map(IDENT -> IDENT.getText())
            .collect(toList());
        String identifier = idents.get(0);

        List<String> identifiers = idents.subList(1, idents.size());
        NameVisitor nameVisitor = new NameVisitor();
        Name type_specifier = ctx.name().accept(nameVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment().accept(commentVisitor);

        Der_class_specifier_value der_class_specifier_value = new Der_class_specifier_value(type_specifier, identifiers, comment);
        return new Der_class_specifier(identifier, der_class_specifier_value);
    }    
}
