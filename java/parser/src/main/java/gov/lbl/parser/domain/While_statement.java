package gov.lbl.parser.domain;

import java.util.Collection;

public class While_statement {
    private String wHile;
    private Collection<Statement> loop;

    public While_statement(String expression,
                           Collection<Statement> statement) {
      this.wHile = expression;
      this.loop = (statement.size()>0 ? statement : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      While_statement aWhile_statement = (While_statement) o;
      if (wHile != null ? !wHile.equals(aWhile_statement.wHile) : aWhile_statement.wHile != null) return false;
      return loop != null ? loop.equals(aWhile_statement.loop) : aWhile_statement.loop == null;
    }

    @Override
    public int hashCode() {
      int result = wHile != null ? wHile.hashCode() : 0;
      result = 31 * result + (loop != null ? loop.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "While_statement{" +
              "\nwhile=" + wHile + '\'' +
              "\nloop=" + loop + '\'' +
              '}';
    }
}
