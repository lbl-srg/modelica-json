package gov.lbl.parser.domain;

import java.util.Collection;

public class Expression_list {
    private Collection<Expression> expression;

    public Expression_list(Collection<Expression> expression) {
      this.expression = (expression.size()>0 ? expression : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Expression_list aExpression_list = (Expression_list) o;
      return expression != null ? expression.equals(aExpression_list.expression) : aExpression_list.expression == null;
    }

    @Override
    public int hashCode() {
      int result = expression != null ? expression.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Expression_list{" +
              "\nexpression=" + expression + '\'' +
              '}';
    }
}
