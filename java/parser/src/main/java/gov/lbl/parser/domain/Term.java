package gov.lbl.parser.domain;

import java.util.Collection;

public class Term {
	private Factor factor;
    private Collection<String> mul_op;
    private Collection<Factor> factors;

    public Term(Factor factor_1,
    		    Collection<String> mul_op,
                Collection<Factor> factor) {
      this.factor = factor_1;
      this.mul_op = (mul_op.size()>0 ? mul_op : null);
      this.factors = (factor != null ? factor : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Term aTerm = (Term) o;
      if (factor != null ? !factor.equals(aTerm.factor) : aTerm.factor != null) return false;
      return mul_op != null ? mul_op.equals(aTerm.mul_op) : aTerm.mul_op == null;
    }

    @Override
    public int hashCode() {
      int result = factor != null ? factor.hashCode() : 0;
      result = 31 * result + (mul_op != null ? mul_op.hashCode() : 0);
      result = 31 * result + (factors != null ? factors.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Term{" +
              "\nfactor=" + factor + '\'' +
              "\nmul_op=" + mul_op + '\'' +
              "\nfactors=" + factors + '\'' +
              '}';
    }
}
