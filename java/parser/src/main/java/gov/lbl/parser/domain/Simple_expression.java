package gov.lbl.parser.domain;

public class Simple_expression {
    private Logical_expression expression1;
    private String operator1;
    private Logical_expression expression2;
    private String operator2;
    private Logical_expression expression3;

    public Simple_expression(Logical_expression logical_expression1,
                             Logical_expression logical_expression2,
                             Logical_expression logical_expression3) {
      this.expression1 = logical_expression1;
      this.operator1 = (logical_expression2==null ? null : ":");
      this.expression2 = logical_expression2;
      this.operator2 = (logical_expression3==null ? null : ":");
      this.expression3 = logical_expression3;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Simple_expression aSimple_expression = (Simple_expression) o;
      return expression1 != null ? expression1.equals(aSimple_expression.expression1) : aSimple_expression.expression1 == null;
    }

    @Override
    public int hashCode() {
      int result = expression1 != null ? expression1.hashCode() : 0;
      result = 31 * result + (operator1 != null ? operator1.hashCode() : 0);
      result = 31 * result + (expression2 != null ? expression2.hashCode() : 0);
      result = 31 * result + (operator2 != null ? operator2.hashCode() : 0);
      result = 31 * result + (expression3 != null ? expression3.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Simple_expression{")
    			     .append("\nexpression1=").append(expression1).append('\'')
    			     .append("\noperator1=").append(operator1).append('\'')
    			     .append("\nexpression2=").append(expression2).append('\'')
    			     .append("\noperator2=").append(operator2).append('\'')
    			     .append("\nexpression3=").append(expression3)
    			     .append('\'').append('}')
    			     .toString();
    }
}
