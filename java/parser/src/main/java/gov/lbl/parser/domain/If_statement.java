package gov.lbl.parser.domain;

import java.util.Collection;

public class If_statement {
    private String iF;
    private Collection<Statement> if_then;
    private Collection<String> elseiF;
    private Collection<Statement> elseif_then;
    private Collection<Statement> eLse;

    public If_statement(String expression1,
                        Collection<Statement> statement1,
                        Collection<String> expression2,
                        Collection<Statement> statement2,
                        Collection<Statement> statement3) {
      this.iF = expression1;
      this.if_then = (statement1 != null ? statement1 : null);
      this.elseiF = (expression2 != null ? expression2 : null);
      this.elseif_then = (statement2 != null ? statement2 : null);
      this.eLse = (statement3 != null ? statement3 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      If_statement aIf_statement = (If_statement) o;

      if (iF != null ? !iF.equals(aIf_statement.iF) : aIf_statement.iF != null) return false;
      if (if_then != null ? !if_then.equals(aIf_statement.if_then) : aIf_statement.if_then != null) return false;
      if (elseiF != null ? !elseiF.equals(aIf_statement.elseiF) : aIf_statement.elseiF != null) return false;
      if (elseif_then != null ? !elseif_then.equals(aIf_statement.elseif_then) : aIf_statement.elseif_then != null) return false;
      return eLse != null ? eLse.equals(aIf_statement.eLse) : aIf_statement.eLse == null;
    }

    @Override
    public int hashCode() {
      int result = iF != null ? iF.hashCode() : 0;
      result = 31 * result + (if_then != null ? if_then.hashCode() : 0);
      result = 31 * result + (elseiF != null ? elseiF.hashCode() : 0);
      result = 31 * result + (elseif_then != null ? elseif_then.hashCode() : 0);
      result = 31 * result + (eLse != null ? eLse.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "If_statement{" +
              "\nif=" + iF + '\'' +
              "\nthen=" + if_then + '\'' +
              "\nelseif=" + elseiF + '\'' +
              "\nthen=" + elseif_then + '\'' +
              "\nelse=" + eLse + '\'' +
              '}';
    }
}
