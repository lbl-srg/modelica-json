package gov.lbl.parser.domain;

public class Relation {
    private Arithmetic_expression expression1;
    private String rel_op;
    private Arithmetic_expression expression2;

    public Relation(Arithmetic_expression arithmetic_expression1,
    		        String rel_op,
                    Arithmetic_expression arithmetic_expression2) {
      this.expression1 = arithmetic_expression1;
      this.rel_op = rel_op;
      this.expression2 = arithmetic_expression2;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Relation aRelation = (Relation) o;
      return expression1 != null ? expression1.equals(aRelation.expression1) : aRelation.expression1 == null;
    }

    @Override
    public int hashCode() {
      int result = expression1 != null ? expression1.hashCode() : 0;
      result = 31 * result + (rel_op != null ? rel_op.hashCode() : 0);
      result = 31 * result + (expression2 != null ? expression2.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Relation{")
    			     .append("\nexpression1=").append(expression1).append('\'')
    			     .append("\noperator=").append(rel_op).append('\'')
    			     .append("\nexpression2=").append(expression2)
    			     .append('\'').append('}')
    			     .toString();
    }
}
