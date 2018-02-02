package gov.lbl.parser.domain;

import java.util.Collection;

public class Logical_term {
	private Logical_factor logical_factor;
    private String logical_relation;
    private Collection<Logical_factor> logical_factors;

    public Logical_term(Logical_factor logical_factor_1,
    					Collection<String> and_decs,
                        Collection<Logical_factor> logical_factor_2) {
      this.logical_factor = logical_factor_1;
      this.logical_relation = (and_decs.size()>0 ? "and" : null);
      this.logical_factors = (logical_factor_2 != null ? logical_factor_2 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Logical_term aLogical_term = (Logical_term) o;
      if (logical_factor != null ? !logical_factor.equals(aLogical_term.logical_factor) : aLogical_term.logical_factor != null) return false;
      return logical_relation != null ? logical_relation.equals(aLogical_term.logical_relation) : aLogical_term.logical_relation == null;
    }

    @Override
    public int hashCode() {
      int result = logical_factor != null ? logical_factor.hashCode() : 0;
      result = 31 * result + (logical_relation != null ? logical_relation.hashCode() : 0);
      result = 31 * result + (logical_factors != null ? logical_factors.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Logical_term{" +
    		  "\nlogical_factor=" + logical_factor + '\'' +
    		  "\nlogical_relation=" + logical_relation + '\'' +
              "\nlogical_factors=" + logical_factors + '\'' +
              '}';
    }
}
