package gov.lbl.parser.domain;

public class Condition_attribute {
    private String iF;
    private Expression expression;

    public Condition_attribute(String if_dec,
                               Expression expression) {
      this.iF = if_dec;
      this.expression = expression;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Condition_attribute aCondition_attribute = (Condition_attribute) o;
      if (iF != null ? !iF.equals(aCondition_attribute.iF) : aCondition_attribute.iF != null) return false;
      return expression != null ? expression.equals(aCondition_attribute.expression) : aCondition_attribute.expression == null;
    }

    @Override
    public int hashCode() {
      int result = iF != null ? iF.hashCode() : 0;
      result = 31 * result + (expression != null ? expression.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Condition_attribute{" +
             "\nif=" + iF + '\'' +
             "\nexpression=" + expression + '\'' +
             '}';
    }
}
