package gov.lbl.parser.domain;

import java.util.Collection;

public class For_statement {
    private String loop_indices;
    private Collection<Statement> loop_statements;

    public For_statement(String for_indices,
                         Collection<Statement> statement) {
      this.loop_indices = for_indices;
      this.loop_statements = (statement.size()>0 ? statement : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      For_statement aFor_statement = (For_statement) o;

      if (loop_indices != null ? !loop_indices.equals(aFor_statement.loop_indices) : aFor_statement.loop_indices != null) return false;
      return loop_statements != null ? loop_statements.equals(aFor_statement.loop_statements) : aFor_statement.loop_statements == null;
    }

    @Override
    public int hashCode() {
      int result = loop_indices != null ? loop_indices.hashCode() : 0;
      result = 31 * result + (loop_statements != null ? loop_statements.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("For_statement{")
    			     .append("\nloop_indices=").append(loop_indices).append('\'')
    			     .append("\nloop_statements=").append(loop_statements)
    			     .append('\'').append('}')
    			     .toString();
    }
}
