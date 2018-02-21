package gov.lbl.parser.domain;

public class Short_class_specifier {
	public String className;
	public String base_prefix;
	public String inputName;
	public String array_subscripts;
	public String class_modification;
	public String prefix;
	public Enum_list enum_list;
	public String list_colon;
	public Comment comment;

    public Short_class_specifier(String enum_dec,
                                 String ident,
                                 String base_prefix,
                                 String name,
                                 String array_subscripts,
                                 String class_modification,
                                 Comment comment,
                                 Enum_list enum_list) {

      this.className = ident;
      this.base_prefix = base_prefix;
      this.inputName = name;
      this.array_subscripts = (array_subscripts == null ? null : array_subscripts);
      this.class_modification = (class_modification == null ? null : class_modification);
      this.prefix = enum_dec;
      this.enum_list = ((enum_dec != null) ? (enum_list!=null ? enum_list : null) : null);
      this.list_colon = ((enum_dec != null && enum_list==null) ? ":" : null);
      this.comment = comment;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Short_class_specifier aShort_class_specifier = (Short_class_specifier) o;

      if (className != null ? !className.equals(aShort_class_specifier.className) : aShort_class_specifier.className != null) return false;
//      return base_prefix != null ? base_prefix.equals(aShort_class_specifier.base_prefix) : aShort_class_specifier.base_prefix == null;
//      return name != null ? name.equals(aShort_class_specifier.name) : aShort_class_specifier.name == null;
      return comment != null ? comment.equals(aShort_class_specifier.comment) : aShort_class_specifier.comment == null;
    }

    @Override
    public int hashCode() {
      int result = className != null ? className.hashCode() : 0;
      result = 31 * result + (prefix != null ? prefix.hashCode() : 0);
      result = 31 * result + (base_prefix != null ? base_prefix.hashCode() : 0);
      result = 31 * result + (inputName != null ? inputName.hashCode() : 0);
      result = 31 * result + (array_subscripts != null ? array_subscripts.hashCode() : 0);
      result = 31 * result + (class_modification != null ? class_modification.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      result = 31 * result + (enum_list != null ? enum_list.hashCode() : 0);
      result = 31 * result + (list_colon != null ? list_colon.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
        return temStr.append("Short_class_specifier{")
        		     .append("\nclassName=").append(className).append('\'')
        		     .append("\nbase_prefix=").append(base_prefix).append('\'')
        		     .append("\ninputName=").append(inputName).append('\'')
        		     .append("\narray_subscripts=").append(array_subscripts).append('\'')
        		     .append("\nclass_modification=").append(class_modification).append('\'')
        		     .append("\nprefix=").append(prefix).append('\'')
        		     .append("\nenum_list=").append(enum_list).append('\'')
        		     .append("\nlist_colon=").append(list_colon).append('\'')
        		     .append("\ncomment=").append(comment)
        		     .append('\'').append('}')
        		     .toString();
    }
}
