package gov.lbl.parser.domain;

public class Equation {
    String simple_expression;
    String operator;
    String expression;
    String if_equation;
    String for_equation;
    Connect_clause connect_clause;
    String when_equation;
    String name;
    String function_call_args;
    Comment comment;

    public Equation(String simple_expression,
    		        String expression,
    		        String if_equation,
    		        String for_equation,
    		        Connect_clause connect_clause,
    		        String when_equation,
                    String name,
                    String function_call_args,
                    Comment comment) {
      this.simple_expression = simple_expression;
      this.operator = (simple_expression==null ? null : "=");
      this.expression = expression;
      this.if_equation = if_equation;
      this.for_equation = for_equation;
      this.connect_clause = connect_clause;
      this.when_equation = when_equation;
      this.name = name;
      this.function_call_args = function_call_args;
      if (comment.string_comment == null && comment.annotation == null) {
    	  this.comment = null;
      } else {
    	  this.comment = comment;
      }
    }


    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Equation aEquation = (Equation) o;
      if (comment != null ? !comment.equals(aEquation.comment) : aEquation.comment != null) return false;
      return ((simple_expression != null ? simple_expression.equals(aEquation.simple_expression) : aEquation.simple_expression == null)
             || (if_equation != null ? if_equation.equals(aEquation.if_equation) : aEquation.if_equation == null)
             || (for_equation != null ? for_equation.equals(aEquation.for_equation) : aEquation.for_equation == null)
             || (connect_clause != null ? connect_clause.equals(aEquation.connect_clause) : aEquation.connect_clause == null)
             || (when_equation != null ? when_equation.equals(aEquation.when_equation) : aEquation.when_equation == null)
             || (name != null ? name.equals(aEquation.name) : aEquation.name == null));
    }

    @Override
    public int hashCode() {
      int result = simple_expression != null ? simple_expression.hashCode() : 0;
      result = 31 * result + (expression != null ? expression.hashCode() : 0);
      result = 31 * result + (if_equation != null ? if_equation.hashCode() : 0);
      result = 31 * result + (for_equation != null ? for_equation.hashCode() : 0);
      result = 31 * result + (connect_clause != null ? connect_clause.hashCode() : 0);
      result = 31 * result + (when_equation != null ? when_equation.hashCode() : 0);
      result = 31 * result + (name != null ? name.hashCode() : 0);
      result = 31 * result + (function_call_args != null ? function_call_args.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Equation{")
    			     .append("\nsimple_expression=").append(simple_expression).append('\'')
    			     .append("\noperator=").append(operator).append('\'')
    			     .append("\nexpression=").append(expression).append('\'')
    			     .append("\nif_equation=").append(if_equation).append('\'')
    			     .append("\nfor_equation=").append(for_equation).append('\'')
    			     .append("\nconnect_clause=").append(connect_clause).append('\'')
    			     .append("\nwhen_equation=").append(when_equation).append('\'')
    			     .append("\nname=").append(name).append('\'')
    			     .append("\nfunction_call_args=").append(function_call_args).append('\'')
    			     .append("\ncomment=").append(comment)
    			     .append('\'').append('}')
    			     .toString();
    }
}
