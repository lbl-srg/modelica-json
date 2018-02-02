package gov.lbl.parser.domain;

public class Element_modification {
    private String name;
    private Modification modification;
    private String_comment comment;

    public Element_modification(String name,
                                Modification modification,
                                String_comment string_comment) {
      this.name = name;
      this.modification = (modification == null ? null : modification);
      this.comment = string_comment;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Element_modification aElement_modification = (Element_modification) o;
      if (name != null ? !name.equals(aElement_modification.name) : aElement_modification.name != null) return false;
      if (comment != null ? !comment.equals(aElement_modification.comment) : aElement_modification.comment != null) return false;
      return modification != null ? modification.equals(aElement_modification.modification) : aElement_modification.modification == null;
    }

    @Override
    public int hashCode() {
      int result = name != null ? name.hashCode() : 0;
      result = 31 * result + (modification != null ? modification.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Element_modification{" +
              "\nname=" + name + '\'' +
              "\nmodification=" + modification + '\'' +
              "\ncomment=" + comment + '\'' +
              '}';
    }
}
