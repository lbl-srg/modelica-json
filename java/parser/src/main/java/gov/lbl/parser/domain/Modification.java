package gov.lbl.parser.domain;

public class Modification {
    private String class_modification;
    private String symbol;
    private String expression;

    public Modification(String class_modification,
    					String eqSymb,
    					String colEqSymb,
    					String expression) {
      this.class_modification = class_modification;
      this.symbol =
    		  (eqSymb == null && colEqSymb == null) ? null : (eqSymb != null ? eqSymb : colEqSymb);
      this.expression = expression;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Modification aModification = (Modification) o;
      return class_modification != null ? class_modification.equals(aModification.class_modification) : aModification.class_modification == null;
    }

    @Override
    public int hashCode() {
      int result = class_modification != null ? class_modification.hashCode() : 0;
      result = 31 * result + (symbol != null ? symbol.hashCode() : 0);
      result = 31 * result + (expression != null ? expression.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Modification{" +
              "\nclass_modification=" + class_modification + '\'' +
              "\nsymbol=" + symbol + '\'' +
              "\nexpression=" + expression + '\'' +
              '}';
    }
}
