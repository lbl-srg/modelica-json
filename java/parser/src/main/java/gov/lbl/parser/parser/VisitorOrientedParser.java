package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaLexer;
import gov.lbl.antlr4.visitor.modelicaParser;

import gov.lbl.parser.domain.*;

import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CharStreams;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.TokenStream;

public class VisitorOrientedParser implements Parser {

    public Stored_definition parse(String modelicaSourceCode) {
    	  CharStream charStream = CharStreams.fromString(modelicaSourceCode);
        modelicaLexer lexer = new modelicaLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        modelicaParser parser = new modelicaParser(tokens);

        Stored_definitionVisitor stored_definitionVisitor = new Stored_definitionVisitor();
        Stored_definition traverseResult = stored_definitionVisitor.visitStored_definition(parser.stored_definition());
        return traverseResult;
    }
}
