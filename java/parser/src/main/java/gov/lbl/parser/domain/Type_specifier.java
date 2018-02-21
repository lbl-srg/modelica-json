package gov.lbl.parser.domain;

public class Type_specifier {
    private String specifier;

    public Type_specifier(String name) {
      this.specifier = name;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Type_specifier aType_specifier = (Type_specifier) o;
      return specifier != null ? specifier.equals(aType_specifier.specifier) : aType_specifier.specifier == null;
    }

    @Override
    public int hashCode() {
      int result = specifier != null ? specifier.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Type_specifier{")
    			     .append("\nspecifier=").append(specifier)
    			     .append('\'').append('}')
    			     .toString();
    }
}
