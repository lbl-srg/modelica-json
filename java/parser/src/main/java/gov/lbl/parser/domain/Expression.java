package gov.lbl.parser.domain;

import java.util.Collection;

public class Expression {
    private Simple_expression simple_expression;
    private Expression iF;
    private Expression if_then;
    private Collection<Expression> elseiF;
    private Collection<Expression> elseif_then;
    private Expression eLse;

    public Expression(Simple_expression simple_expression,
                      Expression expression1,
                      Expression expression2,
                      Collection<Expression> expression3,
                      Collection<Expression> expression4,
                      Expression expression5) {
      this.simple_expression = simple_expression;
      this.iF = expression1;
      this.if_then = expression2;
      this.elseiF = (expression3 != null ? expression3 : null);
      this.elseif_then = (expression4 != null? expression4 : null);
      this.eLse = expression5;
    }
    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Expression aExpression = (Expression) o;
      return (simple_expression != null ? simple_expression.equals(aExpression.simple_expression) : aExpression.simple_expression == null)
           ||(iF != null ? iF.equals(aExpression.iF) : aExpression.iF == null);
    }

    @Override
    public int hashCode() {
      int result = simple_expression != null ? simple_expression.hashCode() : 0;
      result = 31 * result + (iF != null ? iF.hashCode() : 0);
      result = 31 * result + (if_then != null ? if_then.hashCode() : 0);
      result = 31 * result + (elseiF != null ? elseiF.hashCode() : 0);
      result = 31 * result + (elseif_then != null ? elseif_then.hashCode() : 0);
      result = 31 * result + (eLse != null ? eLse.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Expression{" +
              "\nsimple_expression=" + simple_expression + '\'' +
              "\nif=" + iF + '\'' +
              "\nthen=" + if_then + '\'' +
              "\nelseif=" + elseiF + '\'' +
              "\nthen=" + elseif_then + '\'' +
              "\nelse=" + eLse + '\'' +
              '}';
    }
}
