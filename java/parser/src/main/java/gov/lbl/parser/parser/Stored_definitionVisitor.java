package gov.lbl.parser.parser;

import java.util.List;

import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.TerminalNode;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_definition;
import gov.lbl.parser.domain.Final_class_definition;
import gov.lbl.parser.domain.Name;

import java.util.ArrayList;

import gov.lbl.parser.domain.Stored_definition;

public class Stored_definitionVisitor extends modelicaBaseVisitor<Stored_definition> {
  @Override
  public Stored_definition visitStored_definition(modelicaParser.Stored_definitionContext ctx) {
    NameVisitor nameVisitor = new NameVisitor();
    Class_definitionVisitor class_definitionVisitor = new Class_definitionVisitor();

    Name name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);
    String within = name.getName();
    List<Final_class_definition> final_class_definitions = new ArrayList<>();

    List<ParseTree> children = ctx.children;
    Boolean prev_is_final = false;

    for (ParseTree o : children) {            
        if ((o instanceof modelicaParser.Class_definitionContext)) {   
          Class_definition class_definition = o.accept(class_definitionVisitor);
          final_class_definitions.add(new Final_class_definition(prev_is_final, class_definition));
          prev_is_final = false;
        } else if ((o instanceof TerminalNode)) {
            if (o.getText().equals("final")) {
                prev_is_final = true;
            }
        }
    }
    
    return new Stored_definition(within, final_class_definitions);
  }
}