package gov.lbl.parser.domain;

import java.util.Collection;

public class Factor {
    private Collection<Primary> primarys;
    private String operator;

    public Factor(Collection<Primary> primarys, String caret, String dotCaret) {
      this.primarys = (primarys.size() > 0 ? primarys : null);
      this.operator = primarys.size() == 1 ? null
    		          : (caret != null ? "^" : ".^");
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Factor aFactor = (Factor) o;
      return primarys != null ? primarys.equals(aFactor.primarys) : aFactor.primarys == null;
    }

    @Override
    public int hashCode() {
      int result = primarys != null ? primarys.hashCode() : 0;
      result = 31 * result + (operator != null ? operator.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Factor{" +
              "\nprimarys=" + primarys + '\'' +
              "\noperator=" + operator + '\'' +
              '}';
    }
}
