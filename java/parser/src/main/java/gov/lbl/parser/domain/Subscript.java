package gov.lbl.parser.domain;

public class Subscript {
    private Expression subscript;
    private String subscript_colon;

    public Subscript(Expression expression) {
      this.subscript = (expression==null ? null : expression);
      this.subscript_colon = (expression==null ? ":" : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Subscript aSubscript = (Subscript) o;
      return (subscript != null ? subscript.equals(aSubscript.subscript) : aSubscript.subscript == null)
    		|| (subscript_colon != null ? subscript_colon.equals(aSubscript.subscript_colon) : aSubscript.subscript_colon == null);
    }

    @Override
    public int hashCode() {
      int result = subscript != null ? subscript.hashCode() : 0;
      result = 31 * result + (subscript_colon != null ? subscript_colon.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Subscript{")
    		         .append("\nsubscript=").append(subscript).append('\'')
    		         .append("\nsubscript_colon=").append(subscript_colon)
    		         .append('\'').append('}')
    		         .toString();
    }
}
