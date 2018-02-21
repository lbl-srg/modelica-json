package gov.lbl.parser.domain;

public class Named_argument {
    private String name;
    private Function_argument argument;

    public Named_argument(String ident,
                          Function_argument function_argument) {
      this.name = ident;
      this.argument = function_argument;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Named_argument aNamed_argument = (Named_argument) o;
      if (name != null ? !name.equals(aNamed_argument.name) : aNamed_argument.name != null) return false;
      return argument != null ? argument.equals(aNamed_argument.argument) : aNamed_argument.argument == null;
    }

    @Override
    public int hashCode() {
      int result = name != null ? name.hashCode() : 0;
      result = 31 * result + (argument != null ? argument.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Named_argument{")
    			     .append("\nname=").append(name).append('\'')
    			     .append("\nargument=").append(argument)
    			     .append('\'').append('}')
    			     .toString();
    }
}
