package gov.lbl.parser.domain;

import java.util.Collection;

public class When_equation {
    private String when;
    private Collection<Equation> when_then;
    private Collection<String> else_when;
    private Collection<Equation> else_then;

    public When_equation(String expression1,
                         Collection<Equation> equation1,
                         Collection<String> expression2,
                         Collection<Equation> equation2) {
      this.when = expression1;
      this.when_then = (equation1 != null ? equation1 : null);
      this.else_when = (expression2 != null ? expression2 : null);
      this.else_then = (equation2 != null ? equation2 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      When_equation aWhen_equation = (When_equation) o;
      return (when != null ? when.equals(aWhen_equation.when) : aWhen_equation.when == null)
             && (when_then != null ? when_then.equals(aWhen_equation.when_then) : aWhen_equation.when_then == null);
    }

    @Override
    public int hashCode() {
      int result = when != null ? when.hashCode() : 0;
      result = 31 * result + (when_then != null ? when_then.hashCode() : 0);
      result = 31 * result + (else_when != null ? else_when.hashCode() : 0);
      result = 31 * result + (else_then != null ? else_then.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("When_equation{")
    			     .append("\nwhen=").append(when).append('\'')
    			     .append("\nthen=").append(when_then).append('\'')
    			     .append("\nelse_when=").append(else_when).append('\'')
    			     .append("\nthen=").append(else_then)
    			     .append('\'').append('}')
    			     .toString();
    }
}
