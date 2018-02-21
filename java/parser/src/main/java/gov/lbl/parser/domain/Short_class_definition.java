package gov.lbl.parser.domain;

public class Short_class_definition {
    private String prefix;
    private Short_class_specifier specifier;

    public Short_class_definition(String class_prefixes,
                                  Short_class_specifier short_class_specifier) {
      this.prefix = class_prefixes;
      this.specifier = short_class_specifier;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Short_class_definition aShort_class_definition = (Short_class_definition) o;
      if (prefix != null ? !prefix.equals(aShort_class_definition.prefix) : aShort_class_definition.prefix != null) return false;
      return specifier != null ? specifier.equals(aShort_class_definition.specifier) : aShort_class_definition.specifier == null;
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      result = 31 * result + (specifier != null ? specifier.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Short_class_definition{")
    			     .append("\nprefix=").append(prefix).append('\'')
    			     .append("\nspecifier=").append(specifier)
    			     .append('\'').append('}')
    			     .toString();
    }
}
