package gov.lbl.parser.domain;

public class Statement {
	private String component_reference;
	private String operator;
	private String expression;
	private String function_call_args;
    private String output_expression_list;
    private String bReak;
    private String reTurn;
    private If_statement if_statement;
    private For_statement for_statement;
    private While_statement while_statement;
    private When_statement when_statement;
    private Comment comment;

    public Statement(String bre_dec,
                     String ret_dec,
                     String component_reference,
                     String expression,
                     String function_call_args,
                     String output_expression_list,
                     If_statement if_statement,
                     For_statement for_statement,
                     While_statement while_statement,
                     When_statement when_statement,
                     Comment comment) {
    	this.component_reference = component_reference;
        this.operator = ((component_reference != null && output_expression_list == null && expression!=null)
        		        || (component_reference != null && output_expression_list != null)) ? ":=" : null;
        this.expression = expression;
        this.function_call_args = function_call_args;
        this.output_expression_list = output_expression_list;
        this.bReak = bre_dec;
        this.reTurn = ret_dec;
        this.if_statement = if_statement;
        this.for_statement = for_statement;
        this.while_statement = while_statement;
        this.when_statement = when_statement;
        this.comment = comment;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Statement aStatement = (Statement) o;

      if (comment != null ? !comment.equals(aStatement.comment) : aStatement.comment != null) return false;
      return (bReak != null ? bReak.equals(aStatement.bReak) : aStatement.bReak == null)
             || (reTurn != null ? reTurn.equals(aStatement.reTurn) : aStatement.reTurn == null)
             || (component_reference != null ? component_reference.equals(aStatement.component_reference) : aStatement.component_reference == null)
             || (expression != null ? expression.equals(aStatement.expression) : aStatement.expression == null)
             || (function_call_args != null ? function_call_args.equals(aStatement.function_call_args) : aStatement.function_call_args == null)
             || (output_expression_list != null ? output_expression_list.equals(aStatement.output_expression_list) : aStatement.output_expression_list == null)
             || (if_statement != null ? if_statement.equals(aStatement.if_statement) : aStatement.if_statement == null)
             || (for_statement != null ? for_statement.equals(aStatement.for_statement) : aStatement.for_statement == null)
             || (while_statement != null ? while_statement.equals(aStatement.while_statement) : aStatement.while_statement == null);
    }

    @Override
    public int hashCode() {
      int result = bReak != null ? bReak.hashCode() : 0;
      result = 31 * result + (reTurn != null ? reTurn.hashCode() : 0);
      result = 31 * result + (component_reference != null ? component_reference.hashCode() : 0);
      result = 31 * result + (operator != null ? operator.hashCode() : 0);
      result = 31 * result + (expression != null ? expression.hashCode() : 0);
      result = 31 * result + (function_call_args != null ? function_call_args.hashCode() : 0);
      result = 31 * result + (output_expression_list != null ? output_expression_list.hashCode() : 0);
      result = 31 * result + (if_statement != null ? if_statement.hashCode() : 0);
      result = 31 * result + (for_statement != null ? for_statement.hashCode() : 0);
      result = 31 * result + (while_statement != null ? while_statement.hashCode() : 0);
      result = 31 * result + (when_statement != null ? when_statement.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	  return "Statement{" +
                 "\ncomponent_reference=" + component_reference + '\'' +
                 "\noperator=" + operator + '\'' +
                 "\nexpression=" + expression +
                 "\nfunction_call_args=" + function_call_args + '\'' +
    			 "\noutput_expression_list=" + output_expression_list + '\'' +
                 "\nbreak=" + bReak + '\'' +
                 "\nreturn=" + reTurn + '\'' +
                 "\nif_statement=" + if_statement + '\'' +
                 "\nfor_statement=" + for_statement + '\'' +
                 "\nwhile_statement=" + while_statement + '\'' +
                 "\nwhen_statement=" + when_statement + '\'' +
                 "\ncomment=" + comment + '\'' +
                 '}';
    }
}
