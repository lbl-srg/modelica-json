package gov.lbl.parser.domain;

import java.util.Collection;

public class Arithmetic_expression {
	private String add_pre;
    private Collection<Term> terms;
    private Collection<String> adds;

    public Arithmetic_expression(String add_op1,
                                 Collection<Term> terms,
                                 Collection<String> add_op2) {
      this.add_pre = add_op1;
      this.terms = (terms.size() > 0 ? terms : null);
      this.adds = (add_op2 != null? add_op2 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Arithmetic_expression aArithmetic_expression = (Arithmetic_expression) o;
      if (add_pre != null ? !add_pre.equals(aArithmetic_expression.add_pre) : aArithmetic_expression.add_pre != null) return false;
      return terms != null ? terms.equals(aArithmetic_expression.terms) : aArithmetic_expression.terms == null;
    }

    @Override
    public int hashCode() {
      int result = add_pre != null ? add_pre.hashCode() : 0;
      result = 31 * result + (terms != null ? terms.hashCode() : 0);
      result = 31 * result + (adds != null ? adds.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	return "Arithmetic_expression{" +
                "\nadd_pre=" + add_pre + '\'' +
                "\nterms=" + terms + '\'' +
                "\nadds=" + adds + '\'' +
                '}';
    }
}
