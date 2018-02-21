package gov.lbl.parser.domain;

import java.util.Collection;

public class Array_subscripts {
    private Collection<Subscript> subscript;

    public Array_subscripts(Collection<Subscript> subscript) {
      this.subscript = (subscript.size() > 0 ? subscript : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Array_subscripts aArray_subscripts = (Array_subscripts) o;
      return subscript != null ? subscript.equals(aArray_subscripts.subscript) : aArray_subscripts.subscript == null;
    }

    @Override
    public int hashCode() {
      int result = subscript != null ? subscript.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Array_subscripts{")
    			     .append("\nsubscript=").append(subscript)
    			     .append('\'').append('}')
    			     .toString();
    }
}
