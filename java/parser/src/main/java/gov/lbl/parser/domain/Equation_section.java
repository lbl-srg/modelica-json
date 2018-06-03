package gov.lbl.parser.domain;

import java.util.Collection;

public class Equation_section {
    private String prefix;
    private Collection<Equation> equation;

    public Equation_section(String init_dec,
                            String equ_dec,
                            Collection<Equation> equation) {
    	StringBuilder temStr = new StringBuilder();
    	temStr.append(init_dec).append(" ").append(equ_dec);
    	this.prefix = init_dec==null ? equ_dec : temStr.toString();
    	this.equation = (equation.size()>0 ? equation : null);
    }
}
