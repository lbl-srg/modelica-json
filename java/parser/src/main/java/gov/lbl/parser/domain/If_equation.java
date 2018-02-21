package gov.lbl.parser.domain;

import java.util.Collection;

public class If_equation {
    private String iF;
    private Collection<Equation> if_then;
    private Collection<String> elseiF;
    private Collection<Equation> elseif_then;
    private Collection<Equation> eLse;

    public If_equation(String expression1,
                       Collection<Equation> equation1,
                       Collection<String> expression2,
                       Collection<Equation> equation2,
                       Collection<Equation> equation3) {
      this.iF = expression1;
      this.if_then = (equation1 != null ? equation1 : null);
      this.elseiF = (expression2 != null ? expression2 :  null);
      this.elseif_then = (equation2 != null ? equation2 : null);
      this.eLse = (equation3 != null ? equation3 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      If_equation aIf_equation = (If_equation) o;

      return (iF != null ? iF.equals(aIf_equation.iF) : aIf_equation.iF == null)
             && (if_then != null ? if_then.equals(aIf_equation.if_then) : aIf_equation.if_then == null);
    }

    @Override
    public int hashCode() {
      int result = iF != null ? iF.hashCode() : 0;
      result = 31 * result + (if_then != null ? if_then.hashCode() : 0);
      result = 31 * result + (elseiF != null ? elseiF.hashCode() : 0);
      result = 31 * result + (elseif_then != null ? elseif_then.hashCode() : 0);
      result = 31 * result + (eLse != null ? eLse.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("If_equation{")
    			     .append("\nif=").append(iF).append('\'')
    			     .append("\nthen=").append(if_then).append('\'')
    			     .append("\nelseif=").append(elseiF).append('\'')
    			     .append("\nthen=").append(elseif_then).append('\'')
    			     .append("\nelse=").append(eLse)
    			     .append('\'').append('}')
    			     .toString();
    }
}
