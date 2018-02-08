package gov.lbl.parser.domain;

import java.util.Collection;

public class Output_expression_list {
    private Collection<Expression> expression;

    public Output_expression_list(Collection<Expression> expression) {
      this.expression = (expression.size()>0 ? expression : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Output_expression_list aOutput_expression_list = (Output_expression_list) o;
      return expression != null ? expression.equals(aOutput_expression_list.expression) : aOutput_expression_list.expression == null;
    }

    @Override
    public int hashCode() {
      int result = expression != null ? expression.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Output_expression_list{" +
              "\nexpression=" + expression + '\'' +
              '}';
    }
}
