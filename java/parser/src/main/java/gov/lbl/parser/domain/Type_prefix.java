package gov.lbl.parser.domain;

public class Type_prefix {
    private String prefix;

    public Type_prefix(String flow_dec,
                       String stream_dec,
                       String disc_dec,
                       String par_dec,
                       String con_dec,
                       String in_dec,
                       String out_dec) {
    	this.prefix = (flow_dec==null && stream_dec==null && disc_dec==null && par_dec==null
    			       && con_dec==null && in_dec==null && out_dec==null) ? null
    			      : ((flow_dec==null ? "" : flow_dec) + (stream_dec==null ? "" : stream_dec)
    			    	  + (disc_dec==null ? "" : (" " + disc_dec)) + (par_dec==null ? "" : (" " + par_dec))
	                      + (con_dec==null ? "" : (" " + con_dec)) + (in_dec==null ? "" : (" " + in_dec))
	                      + (out_dec==null ? "" : (" " + out_dec)));
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Type_prefix aType_prefix = (Type_prefix) o;
      return (prefix != null ? prefix.equals(aType_prefix.prefix) : aType_prefix.prefix == null);
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Type_prefix{")
    			     .append("\nprefix=").append(prefix)
    			     .append('\'').append('}')
    			     .toString();
    }
}
