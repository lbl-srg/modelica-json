package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Array_subscripts;
import gov.lbl.parser.domain.Component_reference;
import gov.lbl.parser.domain.Component_reference_part;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;
import java.util.List;

public class Component_referenceVisitor extends modelicaBaseVisitor<Component_reference> {
    @Override
    public Component_reference visitComponent_reference(modelicaParser.Component_referenceContext ctx) {                                        
        List<String> identifiers = ctx.IDENT() == null ? null : ctx.IDENT()
                                                .stream()
                                                .map(identifier -> identifier.getText())
                                                .collect(toList());

        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        List<Array_subscripts> array_subscripts_list = ctx.array_subscripts() == null ? null : ctx.array_subscripts()
                                                .stream()
                                                .map(array_subscripts -> array_subscripts.accept(array_subscriptsVisitor))
                                                .collect(toList());

        List<Boolean> array_subscripts_exists = new ArrayList<>();

        Boolean first_dot = false;
        String context_str = ctx.getText();
        if (ctx.getText().charAt(0) == '.') {
            first_dot = true;
            context_str = context_str.substring(1);
        }

        String[] comp_refs =  context_str.split("\\.");
        for (int i=0; i<comp_refs.length; i++) {
            String comp_ref_ident = comp_refs[i];
            if (comp_ref_ident.contains("[")) {
                array_subscripts_exists.add(true);
            }
            else {
                array_subscripts_exists.add(false);
            }
        }
        
        List<Component_reference_part> component_reference_parts = new ArrayList<Component_reference_part>();
        int array_sbuscript_index = 0;
        for(int i=0;i<comp_refs.length;i++) {
            String identifier = identifiers.get(i);
            Boolean dot_op = false;
            if (first_dot && i==0) {
                dot_op = true;
            }
            else if(i>0 && comp_refs.length > 1) {
                dot_op = true;
            }
            
            Array_subscripts array_subscripts = null;
            if (array_subscripts_exists.get(i)) {
                array_subscripts = array_subscripts_list.get(array_sbuscript_index);
                array_sbuscript_index+=1;
            }
            component_reference_parts.add(new Component_reference_part(dot_op, identifier, array_subscripts));
        }
        return new Component_reference(component_reference_parts);
    }
}