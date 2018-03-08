package gov.lbl.parser.domain;

import java.util.Collection;

public class Equation_section {
    private String prefix;
    private Collection<Equation> equation;

    public Equation_section(String init_dec,
                            String equ_dec,
                            Collection<Equation> equation) {
      this.prefix = (init_dec==null ? "" : (init_dec + " ")) + " " + equ_dec;
      this.equation = (equation.size()>0 ? equation : null);
    }
}
