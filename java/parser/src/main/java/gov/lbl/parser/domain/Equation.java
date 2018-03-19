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
}
