package gov.lbl.parser.domain;

import java.util.Collection;

public class Logical_expression {
	private Logical_term logical_term;
    private String logical_relation;
    private Collection<Logical_term> logical_terms;

    public Logical_expression(Logical_term logical_term_1,
    						  Collection<String> or_dec,
    		                  Collection<Logical_term> logical_term_2) {
      this.logical_term = logical_term_1;
      this.logical_relation = (or_dec.size()>0 ? "or" : null);
      this.logical_terms = (logical_term_2 != null ? logical_term_2 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Logical_expression aLogical_expression = (Logical_expression) o;
      if (logical_term != null ? !logical_term.equals(aLogical_expression.logical_term) : aLogical_expression.logical_term != null) return false;
      return logical_relation != null ? logical_relation.equals(aLogical_expression.logical_relation) : aLogical_expression.logical_relation == null;
    }

    @Override
    public int hashCode() {
      int result = logical_term != null ? logical_term.hashCode() : 0;
      result = 31 * result + (logical_relation != null ? logical_relation.hashCode() : 0);
      result = 31 * result + (logical_terms != null ? logical_terms.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Logical_expression{")
    			     .append("\nlogical_term=").append(logical_term).append('\'')
    			     .append("\nlogical_relation=").append(logical_relation).append('\'')
    			     .append("\nlogical_terms=").append(logical_terms)
    			     .append('\'').append('}')
    			     .toString();
    }
}
