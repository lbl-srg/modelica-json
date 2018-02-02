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
      return "Simple_expression{" +
             "\nexpression1=" + expression1 + '\'' +
             "\noperator1=" + operator1 + '\'' +
             "\nexpression2=" + expression2 + '\'' +
             "\noperator2=" + operator2 + '\'' +
             "\nexpression3=" + expression3 + '\'' +
             '}';
    }
}
