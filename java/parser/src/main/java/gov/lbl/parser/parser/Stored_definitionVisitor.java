package gov.lbl.parser.parser;

import java.util.List;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Class_definition;
import gov.lbl.parser.domain.Name;
import static java.util.stream.Collectors.toList;

import gov.lbl.parser.domain.Stored_definition;

public class Stored_definitionVisitor extends modelicaBaseVisitor<Stored_definition> {
  @Override
  public Stored_definition visitStored_definition(modelicaParser.Stored_definitionContext ctx) {
    NameVisitor nameVisitor = new NameVisitor();
    List<Name> names = ctx.name().stream().map(name -> nameVisitor.visitName(name)).collect(toList());
    System.out.println(names.get(0));

    Name name = names.get(0);
    String within = name.getName();

    List<String> final_dec = ctx.FINAL() == null ? null : ctx.FINAL()
            .stream()
            .map(FINAL -> FINAL.getText())
            .collect(toList());
    
    Boolean is_final = false;
    if (final_dec.size() > 0) {
      is_final = true;
    }
    
    Class_definitionVisitor class_definitionVisitor = new Class_definitionVisitor();
    List<Class_definition> class_definitions = ctx.class_definition()
            .stream()
            .map(class_definition -> class_definitionVisitor.visitClass_definition(class_definition))
            .collect(toList());
    return new Stored_definition(within, is_final, class_definitions);
  }
}