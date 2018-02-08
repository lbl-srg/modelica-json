package gov.lbl.parser.domain;

public class Class_prefixes {
    private String prefix;

    public Class_prefixes(String partial_dec,
                          String other_dec) {
      this.prefix = (partial_dec==null ? "" : (partial_dec + " ")) + other_dec;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Class_prefixes aClass_prefixes = (Class_prefixes) o;

      return prefix!=null ? prefix.equals(aClass_prefixes.prefix) : aClass_prefixes.prefix == null;
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Class_prefixes{" +
              "\nprefix=" + prefix + '\'' +
              '}';
    }
}
