package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Array_subscripts;
import gov.lbl.parser.domain.Component_reference;
import gov.lbl.parser.domain.Component_reference_part;

import java.util.ArrayList;
import java.util.List;

import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.TerminalNode;

public class Component_referenceVisitor extends modelicaBaseVisitor<Component_reference> {
    @Override
    public Component_reference visitComponent_reference(modelicaParser.Component_referenceContext ctx) {                                        

        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();


        List<Component_reference_part> component_reference_parts = new ArrayList<Component_reference_part>();

        List<ParseTree> children = ctx.children;
        Boolean dot_op = false;
        Component_reference_part component_reference_part = null; 
        for (ParseTree o : children) {            
            if (o instanceof TerminalNode) {
                if (o.getText().equals(".")) {
                    if (component_reference_part == null) {
                        component_reference_part = new Component_reference_part(null, null, null);
                    } else if (component_reference_part.get_identifier() != null) {
                        component_reference_parts.add(component_reference_part);
                        component_reference_part = new Component_reference_part(null, null, null);
                    }                    
                    dot_op = true;
                    component_reference_part.set_dot_op(dot_op);
                } else {
                    if (component_reference_part == null) {
                        component_reference_part = new Component_reference_part(null, null, null);
                        dot_op = false;
                    } else {
                        component_reference_parts.add(component_reference_part);
                        component_reference_part = new Component_reference_part(null, null, null);
                        dot_op = false;
                    }
                    component_reference_part.set_dot_op(dot_op);
                    component_reference_part.set_identifier(o.getText());
                }
            }
            else if (o instanceof modelicaParser.Array_subscriptsContext) {
                if (component_reference_part == null) {
                    component_reference_part = new Component_reference_part(null, null, null);
                    component_reference_part.set_dot_op(false);
                    component_reference_part.set_identifier("");
                }
                Array_subscripts array_subscripts = o.accept(array_subscriptsVisitor);
                component_reference_part.set_array_subscripts(array_subscripts);
            }
        }
        if (component_reference_part != null) {
            component_reference_parts.add(component_reference_part);
        }
        return new Component_reference(component_reference_parts);
    }
}