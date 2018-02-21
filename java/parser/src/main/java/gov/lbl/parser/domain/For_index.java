package gov.lbl.parser.domain;

public class For_index {
    private String for_index;
    private Expression in_expression;

    public For_index(String ident,
                     Expression expression) {
      this.for_index = ident;
      this.in_expression = (expression == null ? null : expression);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      For_index aFor_index = (For_index) o;
      if (for_index != null ? !for_index.equals(aFor_index.for_index) : aFor_index.for_index != null) return false;
      return in_expression != null ? in_expression.equals(aFor_index.in_expression) : aFor_index.in_expression == null;
    }

    @Override
    public int hashCode() {
      int result = for_index != null ? for_index.hashCode() : 0;
      result = 31 * result + (in_expression != null ? in_expression.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("For_index{")
    			     .append("\nfor_index=").append(for_index).append('\'')
    			     .append("\nin_expression=").append(in_expression)
    			     .append('\'').append('}')
    			     .toString();
    }
}
