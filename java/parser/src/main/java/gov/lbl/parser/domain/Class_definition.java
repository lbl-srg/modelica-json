package gov.lbl.parser.domain;

public class Class_definition {
   private Boolean encapsulated;
   private String class_prefixes; //class_prefixes: (PARTIAL)? (CLASS | MODEL | (OPERATOR)? RECORD | BLOCK | (EXPANDABLE)? CONNECTOR | TYPE | PACKAGE | ((PURE | IMPURE))? (OPERATOR)? FUNCTION | OPERATOR)
   private Class_specifier class_specifier;

   public Class_definition(Boolean encapsulated, String class_prefixes, Class_specifier class_specifier) {
        this.setEncapsulated(encapsulated);
        this.setClass_prefixes(class_prefixes);
        this.setClass_specifier(class_specifier);
   }

   public Class_specifier getClass_specifier() {
      return class_specifier;
   }

   public void setClass_specifier(Class_specifier class_specifier) {
      this.class_specifier = class_specifier;
   }

   public String getClass_prefixes() {
      return class_prefixes;
   }

   public void setClass_prefixes(String class_prefixes) {
      this.class_prefixes = class_prefixes;
   }

   public Boolean getEncapsulated() {
      return encapsulated;
   }

   public void setEncapsulated(Boolean encapsulated) {
      this.encapsulated = encapsulated;
   }
}
