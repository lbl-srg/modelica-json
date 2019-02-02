package gov.lbl.parser.domain;

import gov.lbl.parser.domain.Declaration;

public class Short_class_specifier {
	public String className;
	public String base_prefix;
	public String inputName;
	public String array_subscripts;
	public Declaration.ClassMod class_modification;
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
      if (class_modification != null) {
    	  Declaration test = new Declaration(null, null, class_modification);
    	  String tempStr = class_modification.substring(1,class_modification.length()-1);
    	  Declaration.ClassMod classMod = test.new ClassMod();
    	  classMod.classMod(tempStr);
    	  this.class_modification = classMod;
      } else {
    	  this.class_modification = null;
      }
      this.prefix = enum_dec;
      this.enum_list = ((enum_dec != null) ? (enum_list!=null ? enum_list : null) : null);
      this.list_colon = ((enum_dec != null && enum_list==null) ? ":" : null);
      this.comment = comment;
    }
}
