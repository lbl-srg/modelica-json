package gov.lbl.parser.domain;

public class Class_definition {
   private Boolean is_final;
   private Boolean encapsulated;
   private String class_prefixes; //class_prefixes: (PARTIAL)? (CLASS | MODEL | (OPERATOR)? RECORD | BLOCK | (EXPANDABLE)? CONNECTOR | TYPE | PACKAGE | ((PURE | IMPURE))? (OPERATOR)? FUNCTION | OPERATOR)
   private Class_specifier class_specifier;

   public Class_definition(Boolean is_final, Boolean encapsulated, String class_prefixes, Class_specifier class_specifier) {
        this.is_final = is_final;
        this.encapsulated = encapsulated;
        this.class_prefixes = class_prefixes;
        this.class_specifier = class_specifier;
   }
}
